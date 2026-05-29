# syntax=docker/dockerfile:1

# ============================================
# BASE IMAGE
# ============================================
FROM node:22-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# ============================================
# SHARED: Install dependencies
# ============================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# ============================================
# BUILD STAGES
# ============================================
FROM base AS build-source
COPY . .
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true

FROM deps AS build-client
COPY . .
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
WORKDIR /app/apps/client
ENV NODE_ENV=production
RUN pnpm run build

# ============================================
# SHARED: Production base setup
# ============================================
FROM base AS production-base
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs appuser

# ============================================
# PRODUCTION: API
# ============================================
FROM production-base AS api
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps --chown=appuser:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps --chown=appuser:nodejs /app/apps ./apps
COPY --from=deps --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/apps/api ./apps/api
COPY --from=build-source --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/tsconfig.json ./tsconfig.json
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true
WORKDIR /app/apps/api
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["pnpm", "run", "start"]

# ============================================
# PRODUCTION: CLIENT
# ============================================
FROM production-base AS client
COPY --from=build-client --chown=appuser:nodejs /app/apps/client/.output ./apps/client/.output
COPY --from=build-client --chown=appuser:nodejs /app/apps/client/package.json ./apps/client/package.json
WORKDIR /app/apps/client
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", ".output/server/index.mjs"]

# ============================================
# PRODUCTION: WORKERS
# ============================================
FROM production-base AS workers
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps --chown=appuser:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps --chown=appuser:nodejs /app/apps ./apps
COPY --from=deps --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/apps/workers ./apps/workers
COPY --from=build-source --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/tsconfig.json ./tsconfig.json
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true
WORKDIR /app/apps/workers
USER appuser
CMD ["pnpm", "run", "start"]
