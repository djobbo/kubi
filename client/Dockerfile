FROM oven/bun:1-slim

ARG VITE_CLIENT_URL
ARG VITE_API_URL
ARG VITE_SOCIAL_DISCORD_URL
ARG VITE_SOCIAL_GITHUB_URL
ARG VITE_SOCIAL_TWITTER_URL
ARG VITE_SOCIAL_KOFI_URL
ARG VITE_BRAWLHALLA_WIKI_URL
ARG VITE_GOOGLE_ANALYTICS_TRACKING_ID
ARG VITE_GOOGLE_ADSENSE_ID

ENV VITE_CLIENT_URL=${CLIENT_URL}
ENV VITE_API_URL=${API_URL}
ENV VITE_SOCIAL_DISCORD_URL=${SOCIAL_DISCORD_URL}
ENV VITE_SOCIAL_GITHUB_URL=${SOCIAL_GITHUB_URL}
ENV VITE_SOCIAL_TWITTER_URL=${SOCIAL_TWITTER_URL}
ENV VITE_SOCIAL_KOFI_URL=${SOCIAL_KOFI_URL}
ENV VITE_BRAWLHALLA_WIKI_URL=${BRAWLHALLA_WIKI_URL}
ENV VITE_GOOGLE_ANALYTICS_TRACKING_ID=${GOOGLE_ANALYTICS_TRACKING_ID}
ENV VITE_GOOGLE_ADSENSE_ID=${GOOGLE_ADSENSE_ID}

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
