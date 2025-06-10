FROM oven/bun:1 AS dependencies

WORKDIR /app

COPY package.json bun.lock ./

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

COPY package.json bun.lock ./

COPY --from=build /app/packages ./packages
COPY --from=build /app/api ./api
COPY --from=build /app/client/public ./client/public
COPY --from=build /app/client/package.json ./client/
COPY --from=build /app/client/.vinxi ./client/.vinxi

# Install only production dependencies
RUN bun install --frozen-lockfile --production

WORKDIR /app/client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs
USER bunjs

EXPOSE 3001

CMD ["bun", "run", "start"]
