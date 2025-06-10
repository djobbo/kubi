FROM oven/bun:1 AS dependencies

WORKDIR /app

COPY package.json bun.lock ./

COPY packages/ ./packages/
COPY api/ ./api/
COPY client/ ./client/

# Install all dependencies including devDependencies for build
RUN bun install --frozen-lockfile

FROM dependencies AS build

# Build the API if you have a build step
WORKDIR /app/api
RUN bun run build 2>/dev/null || echo "No build script found, skipping..."

FROM oven/bun:1-slim AS production

WORKDIR /app

COPY package.json bun.lock ./

COPY --from=build /app/packages ./packages
COPY --from=build /app/api ./api
COPY --from=build /app/client/package.json ./client/

# Install only production dependencies
RUN bun install --frozen-lockfile --production

WORKDIR /app/api

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs
USER bunjs

EXPOSE 3000

CMD ["bun", "run", "start"]
