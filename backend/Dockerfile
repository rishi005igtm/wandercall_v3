# ═══════════════════════════════════════════════════════════════════════════════
# Wandercall Backend — Production Dockerfile
# Multi-stage build: dependencies → builder → production
# Target: node:22-alpine (slim, ~50MB base)
# Non-root user: node (UID 1000)
# ═══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Install ALL dependencies (including devDeps for build) ────────────
FROM node:22-alpine AS deps

# Install build tools needed by native deps (bcrypt uses node-gyp)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy only package manifests first — layer cache: deps only reinstalled on change
COPY package.json package-lock.json ./

# Install ALL dependencies (dev + prod) needed to compile TypeScript
# Use BuildKit cache to drastically speed up repeated builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --frozen-lockfile


# ── Stage 2: Build TypeScript → JavaScript ───────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Compile: outputs to /app/dist
RUN npm run build


# ── Stage 3: Production image — minimal attack surface ──────────────────────
FROM node:22-alpine AS production

# Security: do not run as root
# node user (UID 1000) is pre-created in official node images
USER root

# Install dumb-init to ensure proper SIGTERM/SIGINT propagation to Node.js
RUN apk add --no-cache dumb-init python3 make g++ && \
    mkdir -p /app && chown -R node:node /app

WORKDIR /app

# Set NODE_ENV so packages skip dev code paths
ENV NODE_ENV=production

# Copy compiled output
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy package manifests for prod-only install
COPY --chown=node:node package.json package-lock.json ./

# Install only production dependencies
# Use root temporarily to install build tools, then drop back to node user
RUN --mount=type=cache,target=/root/.npm \
    npm ci --frozen-lockfile --omit=dev && \
    apk del python3 make g++ && \
    rm -rf /tmp/* /root/.npm

# Switch back to non-root user
USER node

# Expose the NestJS HTTP port (overridable via PORT env)
EXPOSE 5000

# ── Health check (polls the /api/v1/health endpoint every 30s) ────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/v1/health || exit 1

# ── Entrypoint ────────────────────────────────────────────────────────────────
# Use dumb-init to wrap node, so signals are passed down efficiently and zombie processes are reaped
CMD ["dumb-init", "node", "dist/main"]
