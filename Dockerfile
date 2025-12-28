# syntax=docker/dockerfile:1

# ============================================
# BASE IMAGE
# ============================================
FROM oven/bun:1.3 AS base
WORKDIR /app

# ============================================
# SHARED: Install dependencies
# ============================================
FROM base AS deps
COPY . /tmp/src
RUN <<EOF
  cd /tmp/src
  cp package.json bun.lock /app/
  find . -path "./node_modules" -prune -o -name "package.json" -print | while read f; do
    mkdir -p "/app/$(dirname "$f")"
    cp "$f" "/app/$f"
  done
EOF
RUN bun install --frozen-lockfile

# ============================================
# BUILD STAGES
# ============================================
FROM base AS build-source
COPY . .
# SECURITY: Remove secrets before build
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true

FROM deps AS build-client
COPY . .
# SECURITY: Remove secrets before build
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true
WORKDIR /app/apps/client
ENV NODE_ENV=production
RUN bun run build

FROM deps AS build-cms
COPY . .
# SECURITY: Remove secrets before build
RUN find /app -name ".env*" -type f ! -name ".env.example" -exec rm -f {} \; 2>/dev/null || true
RUN find /app -name "*.db" -o -name "*.sqlite" -type f -exec rm -f {} \; 2>/dev/null || true
WORKDIR /app/apps/cms
ENV NODE_ENV=production
RUN bun run build

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
# Build: docker build --target api -t kubi-api .
# ============================================
FROM production-base AS api
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/bun.lock ./bun.lock
COPY --from=deps --chown=appuser:nodejs /app/apps ./apps
COPY --from=deps --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/apps/api ./apps/api
COPY --from=build-source --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/tsconfig.json ./tsconfig.json
# SECURITY: Final cleanup
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.db" -o -name "*.sqlite" -type f -delete 2>/dev/null || true && \
    find /app -name "*.pem" -o -name "*.key" -type f -delete 2>/dev/null || true
WORKDIR /app/apps/api
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "run", "start"]

# ============================================
# PRODUCTION: CLIENT
# Build: docker build --target client -t kubi-client .
# ============================================
FROM production-base AS client
COPY --from=build-client --chown=appuser:nodejs /app/apps/client/.output ./apps/client/.output
COPY --from=build-client --chown=appuser:nodejs /app/apps/client/package.json ./apps/client/package.json
WORKDIR /app/apps/client
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "run", ".output/server/index.mjs"]

# ============================================
# PRODUCTION: WORKERS
# Build: docker build --target workers -t kubi-workers .
# ============================================
FROM production-base AS workers
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/bun.lock ./bun.lock
COPY --from=deps --chown=appuser:nodejs /app/apps ./apps
COPY --from=deps --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/apps/workers ./apps/workers
COPY --from=build-source --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-source --chown=appuser:nodejs /app/tsconfig.json ./tsconfig.json
# SECURITY: Final cleanup
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.db" -o -name "*.sqlite" -type f -delete 2>/dev/null || true && \
    find /app -name "*.pem" -o -name "*.key" -type f -delete 2>/dev/null || true
WORKDIR /app/apps/workers
USER appuser
CMD ["bun", "run", "start"]

# ============================================
# PRODUCTION: CMS (Strapi)
# Build: docker build --target cms -t kubi-cms .
# ============================================
FROM production-base AS cms
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=deps --chown=appuser:nodejs /app/bun.lock ./bun.lock
COPY --from=deps --chown=appuser:nodejs /app/apps ./apps
COPY --from=deps --chown=appuser:nodejs /app/packages ./packages
COPY --from=build-cms --chown=appuser:nodejs /app/apps/cms ./apps/cms
# SECURITY: Final cleanup
RUN find /app -name ".env*" -type f ! -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.db" -o -name "*.sqlite" -type f -delete 2>/dev/null || true && \
    find /app -name "*.pem" -o -name "*.key" -type f -delete 2>/dev/null || true
WORKDIR /app/apps/cms
RUN mkdir -p public/uploads && chown -R appuser:nodejs public/uploads
USER appuser
EXPOSE 1337
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD bun -e "fetch('http://localhost:1337/_health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "run", "start"]
