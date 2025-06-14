FROM oven/bun:1-slim

WORKDIR /app

COPY . .

# Install dependencies and build
RUN bun install --frozen-lockfile && \
    cd client && \
    echo "=== Listing client directory ===" && \
    ls -la && \
    echo "=== Checking vite.config.ts ===" && \
    cat vite.config.ts && \
    echo "=== Starting build with debug ===" && \
    DEBUG=vite:* bun run build

# Create non-root user and data directory with proper permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs

USER bunjs

WORKDIR /app/client

EXPOSE 5173

CMD ["bun", "run", "start"] 
