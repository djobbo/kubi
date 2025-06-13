FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lock ./
COPY api/package.json ./api/
COPY packages/ ./packages/
COPY client/ ./client/

# Install dependencies and build
RUN bun install --frozen-lockfile && \
    cd client && \
    bun run build

# Create non-root user and data directory with proper permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs

USER bunjs

WORKDIR /app/client

EXPOSE 5173

CMD ["bun", "run", "start"] 
