# Workers

Background workers for the dair.gg platform. These workers call the main API via HTTP to crawl and archive Brawlhalla data.

## Workers

### Leaderboard Crawler

- **Schedule**: Every 10 minutes
- **Purpose**: Crawl 1v1, 2v2, and rotating rankings for all regions
- **Data**: Stores rankings snapshots for "who's playing now" features

### Rankings Crawler

- **Schedule**: Every 6 hours
- **Purpose**: Crawl full player stats for players found in rankings
- **Data**: Stores historical player data for tracking and global rankings

## Environment Variables

```bash
# Required: URL of the main API
API_URL=http://localhost:3000

# Required: API key for worker authentication (enables fetch-first strategy)
WORKER_API_KEY=your-secret-worker-api-key
```

## Development

```bash
# Install dependencies
bun install

# Run workers in development (with hot reload)
bun dev

# Run workers in production
bun start
```

## Architecture

Workers communicate with the API via HTTP, using the same endpoints as the frontend:

1. Workers make HTTP requests with `X-Worker-API-Key` header
2. API detects the header and uses **fetch-first** strategy (bypasses cache)
3. API automatically archives data when called with worker key
4. Workers have their own rate limiter to control API call frequency

This architecture allows:

- Workers to be deployed separately from the API
- Easy horizontal scaling of workers
- Clear separation of concerns
- The API maintains the single rate limit for external Brawlhalla API calls
