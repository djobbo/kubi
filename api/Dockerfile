FROM oven/bun:1-slim

WORKDIR /app

COPY . .

# Install dependencies and build
RUN bun install --frozen-lockfile && \
    cd api && \
    bun run build 2>/dev/null || echo "No build script found, skipping..."

# Create non-root user and data directory with proper permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs && \
    mkdir -p /data && \
    chown -R bunjs:nodejs /data && \
    chmod 755 /data

USER bunjs

WORKDIR /app/api

EXPOSE 3000

CMD ["bun", "run", "start"]
