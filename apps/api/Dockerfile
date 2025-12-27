# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock ./
# Apps
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/
COPY apps/workers/package.json ./apps/workers/
# Packages
COPY packages/api-contract/package.json ./packages/api-contract/
COPY packages/brawlhalla-api/package.json ./packages/brawlhalla-api/
COPY packages/brawlhalla-replays/package.json ./packages/brawlhalla-replays/
COPY packages/brawlhalla-servers/package.json ./packages/brawlhalla-servers/
COPY packages/common/package.json ./packages/common/
COPY packages/db/package.json ./packages/db/
COPY packages/schema/package.json ./packages/schema/
RUN bun install --frozen-lockfile

# Build stage - copy source code
FROM base AS build
COPY . .

# SECURITY: Verify no secrets leaked into build stage
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs appuser

# Copy node_modules directly from deps stage
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy ALL workspace package.json files (required for Bun workspace resolution)
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/bun.lock ./bun.lock
COPY --from=deps --chown=appuser:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps --chown=appuser:nodejs /app/apps/client/package.json ./apps/client/package.json
COPY --from=deps --chown=appuser:nodejs /app/apps/workers/package.json ./apps/workers/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/api-contract/package.json ./packages/api-contract/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/brawlhalla-api/package.json ./packages/brawlhalla-api/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/brawlhalla-replays/package.json ./packages/brawlhalla-replays/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/brawlhalla-servers/package.json ./packages/brawlhalla-servers/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/common/package.json ./packages/common/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/db/package.json ./packages/db/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/schema/package.json ./packages/schema/package.json

# Copy source code
COPY --from=build --chown=appuser:nodejs /app/apps/api ./apps/api
COPY --from=build --chown=appuser:nodejs /app/packages ./packages
COPY --from=build --chown=appuser:nodejs /app/tsconfig.json ./tsconfig.json

# SECURITY: Final cleanup - ensure no secrets in production image
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.db" -o -name "*.sqlite" -type f -delete 2>/dev/null || true && \
    find /app -name "*.pem" -o -name "*.key" -type f -delete 2>/dev/null || true

WORKDIR /app/apps/api

# Run as non-root user
USER appuser

EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "start"]
