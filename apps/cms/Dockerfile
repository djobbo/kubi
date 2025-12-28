# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /app

# Install bun for package management (monorepo uses bun)
RUN npm install -g bun

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock ./
# Apps
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/
COPY apps/cms/package.json ./apps/cms/
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

# Build stage - build Strapi admin panel
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# SECURITY: Remove secrets before build
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true

WORKDIR /app/apps/cms
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs appuser

# Copy node_modules directly from deps stage
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy ALL workspace package.json files (required for workspace resolution)
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/bun.lock ./bun.lock
COPY --from=deps --chown=appuser:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps --chown=appuser:nodejs /app/apps/client/package.json ./apps/client/package.json
COPY --from=deps --chown=appuser:nodejs /app/apps/cms/package.json ./apps/cms/package.json
COPY --from=deps --chown=appuser:nodejs /app/apps/workers/package.json ./apps/workers/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/api-contract/package.json ./packages/api-contract/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/brawlhalla-api/package.json ./packages/brawlhalla-api/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/brawlhalla-replays/package.json ./packages/brawlhalla-replays/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/brawlhalla-servers/package.json ./packages/brawlhalla-servers/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/common/package.json ./packages/common/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/db/package.json ./packages/db/package.json
COPY --from=deps --chown=appuser:nodejs /app/packages/schema/package.json ./packages/schema/package.json

# Copy CMS source and built admin panel
COPY --from=build --chown=appuser:nodejs /app/apps/cms ./apps/cms

# SECURITY: Final cleanup - ensure no secrets in production image
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.db" -o -name "*.sqlite" -type f -delete 2>/dev/null || true && \
    find /app -name "*.pem" -o -name "*.key" -type f -delete 2>/dev/null || true

WORKDIR /app/apps/cms

# Create uploads directory with correct permissions
RUN mkdir -p public/uploads && chown -R appuser:nodejs public/uploads

# Run as non-root user
USER appuser

EXPOSE 1337

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://localhost:1337/_health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]

