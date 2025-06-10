FROM oven/bun:1 as dependencies

WORKDIR /app
# Copy all package.json files first
COPY package.json bun.lock ./
COPY packages/*/package.json ./packages/
COPY api/package.json ./api/
COPY client/package.json ./client/

# Create necessary directories for workspace packages
RUN find packages -name package.json -exec dirname {} \; | xargs -I {} mkdir -p {}

# Copy all source files for workspace packages
COPY packages/ ./packages/
COPY api/ ./api/
COPY client/ ./client/

# Install all dependencies including devDependencies for build
RUN bun install --frozen-lockfile

FROM dependencies AS build
        
WORKDIR /app/client
RUN bun run build

FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy all package.json files
COPY package.json bun.lock ./
COPY packages/*/package.json ./packages/
COPY api/package.json ./api/
COPY client/package.json ./client/

# Create necessary directories
RUN find packages -name package.json -exec dirname {} \; | xargs -I {} mkdir -p {}

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built application and source packages
COPY --from=build /app/packages ./packages
COPY --from=build /app/client/public ./client/public
COPY --from=build /app/client/package.json ./client/
COPY --from=build /app/client/.vinxi ./client/.vinxi

WORKDIR /app/client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs
USER bunjs

EXPOSE 3001

CMD ["bun", "run", "start"]
