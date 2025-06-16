FROM oven/bun:1-slim as builder

ARG VITE_CLIENT_URL
ENV VITE_CLIENT_URL=${VITE_CLIENT_URL}

WORKDIR /app

COPY package.json bun.lock ./
COPY api/package.json ./api/
COPY packages/ ./packages/
COPY client/ ./client/

RUN bun install --frozen-lockfile && \
    cd client && \
    bun run build

FROM oven/bun:1-slim

WORKDIR /app/client

# Copy only the necessary files from the builder stage
COPY --from=builder /app/client/package.json ./
COPY --from=builder /app/client/.output ./.output
COPY --from=builder /app/client/.tanstack ./.tanstack
COPY --from=builder /app/client/.nitro ./.nitro
COPY --from=builder /app/client/node_modules ./node_modules

# Create non-root user and data directory with proper permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs

USER bunjs

EXPOSE 3000

CMD ["bun", "run", "start"] 
