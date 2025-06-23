FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lock ./
COPY packages/ ./packages/
COPY api/ ./api/
COPY client/ ./client/

# Install dependencies and build
RUN bun install --frozen-lockfile && \
    cd client && \
    bun run build

# Create non-root user and data directory with proper permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs && \
    mkdir -p /data && \
    chown -R bunjs:nodejs /data && \
    chmod 755 /data

USER bunjs

WORKDIR /app/client

EXPOSE 3000

CMD ["bun", "run", "start"]
