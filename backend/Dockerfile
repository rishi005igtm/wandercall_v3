# ═══════════════════════════════════════════════════════════════════════════════
# Wandercall Backend — Production Dockerfile
# Multi-stage build: deps → builder → prod-deps → production
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


# ── Stage 3: Install ONLY Production Dependencies ──────────────────────────────
FROM node:22-alpine AS prod-deps

# Install build tools needed for native prod deps (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./

# Install only production dependencies using BuildKit cache.
# We DO NOT delete /root/.npm here, because it's an active BuildKit mount.
# The cache will stay on the host machine and out of our final image.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --frozen-lockfile --omit=dev


# ── Stage 4: Production image — minimal attack surface ──────────────────────
FROM node:22-alpine AS production

# Security: do not run as root. node user (UID 1000) is pre-created in official node images
USER root

# Install dumb-init to ensure proper SIGTERM/SIGINT propagation to Node.js
# We no longer install g++ or python3 here!
RUN apk add --no-cache dumb-init && \
    mkdir -p /app && chown -R node:node /app

WORKDIR /app

# Set NODE_ENV so packages skip dev code paths and Node optimizes GC
ENV NODE_ENV=production
# Add extra Node optimizations for production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy compiled output from the builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy strictly production node_modules from the prod-deps stage
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./

# Switch back to non-root user
USER node

# Expose the NestJS HTTP port (overridable via PORT env)
EXPOSE 5000

# ── Health check (polls the /api/v1/health/ready endpoint every 30s) ────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/v1/health/ready || exit 1

# ── Entrypoint ────────────────────────────────────────────────────────────────
# Use dumb-init to wrap node, so signals are passed down efficiently and zombie processes are reaped
CMD ["dumb-init", "node", "dist/main"]
