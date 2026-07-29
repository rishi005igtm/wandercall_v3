# Enterprise CI/CD Workflow & Docker Lifecycle

## Overview
Wandercall employs an enterprise-grade CI/CD pipeline orchestrated via Jenkins (`backend/Jenkinsfile`), utilizing a multi-stage Docker build process with aggressive BuildKit caching. The deployment pipeline prioritizes zero-downtime rolling updates, automated rollback capability, and strict AWS storage (EBS) cost optimizations.

## Deployment Workflow
The complete deployment sequence executes as follows:
1. **Git Push** → triggers the Jenkins webhook.
2. **Repository Checkout** → fetches the latest commit.
3. **Dependency Hydration** → uses `npm ci --cache ~/.npm --prefer-offline`.
4. **Security & Code Quality Validation** (Parallel) → runs NPM Audit, ESLint, and TypeScript validation.
5. **Docker Image Build** → uses `--target production` with BuildKit caching.
6. **Local Pre-Push Verification** → spins up a temporary container (`wandercall-test-container`) and polls its health endpoint. If it fails, the pipeline aborts and no image is pushed.
7. **Registry Push** → pushes `latest` and `commit-sha` tags to DockerHub.
8. **Enterprise Deployment** → captures the running container's image as `env.PREVIOUS_IMAGE`, swaps the container, and injects `.env.production`.
9. **Production Health Verification** → polls `/api/v1/health/ready`.
10. **Cleanup & Artifact Grooming (On Success)** → triggers the storage management scripts.

## Rollback Process
Wandercall maintains a strict automated rollback mechanism to minimize production downtime.
- Before a new container replaces the old one, the currently running image ID is saved to `env.PREVIOUS_IMAGE`.
- If the **Production Health Verification** stage fails (i.e., the container boots but the `/api/v1/health/ready` endpoint returns non-200 or times out), the pipeline triggers the `failure {}` post-action.
- The broken container is forcefully removed, and the exact image stored in `env.PREVIOUS_IMAGE` is immediately booted back up with `.env.production`.

## Docker Image Lifecycle and Retention Policy
To prevent unbound growth on the deployment host (which results in rapidly escalating AWS EBS costs and potential ENOSPC outages), the following retention policy is enforced post-deployment:
1. **Active Container**: Always preserved.
2. **Rollback Targets**: The 2 most recent successful historical images are retained locally to satisfy the rollback constraints.
3. **Historical Cleanup**: Any image older than the top 3 (active + 2 historical) is forcefully pruned (`docker rmi -f`) automatically after a successful deployment.

## BuildKit Cache Management Strategy
BuildKit caches intermediate layers (like downloaded NPM packages via `--mount=type=cache`). Left unchecked, these mounts will permanently consume host disk space.
- Post-deployment, the pipeline executes: `docker builder prune -f --keep-storage 5GB`.
- This ensures the BuildKit cache never exceeds 5GB. It preserves recent cache hits for rapid incremental builds while automatically evicting stale packages and layers.

## Dangling Image Grooming
During multi-stage Docker builds, intermediate images and displaced `latest` tags become untagged (`<none>:<none>`).
- Post-deployment, `docker image prune -f` is executed to wipe out all dangling image layers safely.

## Operational Runbook for Maintenance
If storage alerts fire on the Jenkins/Deployment host:
1. Check if a hanging container is preventing `docker rmi` from deleting old images.
2. Verify that `docker builder prune` is executing successfully in Jenkins logs.
3. Inspect `docker system df` to determine what class of data is consuming disk.
4. Manually trigger a cleanup via `docker system prune -a --volumes` **ONLY IF** you do not need the active BuildKit cache or rollback images (will cause the next build to be significantly slower).
