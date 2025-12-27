# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/client/package.json ./apps/client/
COPY packages/api-contract/package.json ./packages/api-contract/
COPY packages/brawlhalla-api/package.json ./packages/brawlhalla-api/
COPY packages/common/package.json ./packages/common/
RUN bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/client/node_modules ./apps/client/node_modules
COPY --from=deps /app/packages/api-contract/node_modules ./packages/api-contract/node_modules
COPY --from=deps /app/packages/brawlhalla-api/node_modules ./packages/brawlhalla-api/node_modules
COPY --from=deps /app/packages/common/node_modules ./packages/common/node_modules
COPY . .

# SECURITY: Remove any accidentally copied secrets before build
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true

WORKDIR /app/apps/client
ENV NODE_ENV=production
RUN bun run build

# Production stage - minimal footprint (only built assets)
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs appuser

# Copy ONLY the built output - no source code, no secrets possible
COPY --from=build --chown=appuser:nodejs /app/apps/client/.output ./apps/client/.output
COPY --from=build --chown=appuser:nodejs /app/apps/client/package.json ./apps/client/package.json

WORKDIR /app/apps/client

# Run as non-root user
USER appuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", ".output/server/index.mjs"]
