# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/workers/package.json ./apps/workers/
COPY packages/api-contract/package.json ./packages/api-contract/
COPY packages/brawlhalla-api/package.json ./packages/brawlhalla-api/
COPY packages/common/package.json ./packages/common/
RUN bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/workers/node_modules ./apps/workers/node_modules
COPY --from=deps /app/packages/api-contract/node_modules ./packages/api-contract/node_modules
COPY --from=deps /app/packages/brawlhalla-api/node_modules ./packages/brawlhalla-api/node_modules
COPY --from=deps /app/packages/common/node_modules ./packages/common/node_modules
COPY . .

# SECURITY: Verify no secrets leaked into build stage
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true

# Production stage - minimal footprint
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs appuser

# Copy only necessary files
COPY --from=build --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/apps/workers ./apps/workers
COPY --from=build --chown=appuser:nodejs /app/packages ./packages
COPY --from=build --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=build --chown=appuser:nodejs /app/bun.lock ./bun.lock
COPY --from=build --chown=appuser:nodejs /app/tsconfig.json ./tsconfig.json

# SECURITY: Final cleanup - ensure no secrets in production image
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.db" -o -name "*.sqlite" -type f -delete 2>/dev/null || true && \
    find /app -name "*.pem" -o -name "*.key" -type f -delete 2>/dev/null || true

WORKDIR /app/apps/workers

# Run as non-root user
USER appuser

CMD ["bun", "run", "start"]
