# dair.gg

A Brawlhalla statistics and analytics platform built with Effect, featuring real-time player stats, rankings, and historical data tracking.

## Tech Stack

| Component     | Technology                                         |
| ------------- | -------------------------------------------------- |
| Toolchain     | Vite+ (`vp`) + pnpm (from `.repos/vite-plus`)      |
| Monorepo      | Turborepo                                          |
| Backend       | Node.js + Effect + `@effect/platform-node`         |
| Frontend      | React 19 + Vite + TanStack Router + TailwindCSS    |
| Database      | PostgreSQL + Drizzle ORM                           |
| Cache         | Redis (LRU eviction)                               |
| Observability | OpenTelemetry + Grafana Stack (Alloy, Loki, Tempo) |
| i18n          | Lingui                                             |
| Type Safety   | TypeScript + Effect Schema                         |

## Project Structure

```
dair/
├── apps/
│   ├── api/                      # Backend API server
│   │   ├── src/
│   │   │   ├── routes/           # API route handlers
│   │   │   ├── services/         # Business logic & external integrations
│   │   │   │   ├── archive/      # Historical data storage
│   │   │   │   ├── brawlhalla-api/  # External Brawlhalla API client
│   │   │   │   ├── cache/        # Redis cache service
│   │   │   │   ├── db/           # Database client (Drizzle)
│   │   │   │   ├── fetcher/      # HTTP client with cache-first strategy
│   │   │   │   └── rate-limiter/ # API rate limiting
│   │   │   └── workers/          # Background crawlers
│   │   └── migrations/           # Drizzle migrations
│   ├── client/                   # Frontend React app
│   │   ├── src/
│   │   │   ├── features/         # Feature modules (i18n, layout, search)
│   │   │   ├── routes/           # TanStack Router pages
│   │   │   └── shared/           # Shared components & utilities
│   │   └── public/               # Static assets
│   ├── migrator/                 # Supabase → PG data migration (phase 3)
│   └── monitoring/               # Grafana observability stack config
│       ├── alloy/                # OpenTelemetry collector config
│       ├── grafana/              # Dashboards & datasources
│       ├── loki/                 # Log aggregation config
│       └── tempo/                # Distributed tracing config
│
├── packages/
│   ├── api-contract/             # Shared API contracts (Effect HttpApi)
│   │   └── src/routes/           # Route schemas & types
│   ├── brawlhalla-api/           # Brawlhalla API types & helpers
│   │   ├── src/api/schema/       # API response schemas
│   │   ├── src/constants/        # Game data (legends, weapons, tiers)
│   │   └── src/helpers/          # Parsing & calculation utilities
│   ├── brawlhalla-replays/       # Replay file parser
│   ├── brawlhalla-servers/       # Server location data
│   ├── common/                   # Shared utilities (math, date, string)
│   ├── db/                       # Database schema (Drizzle)
│   │   └── src/schema/
│   │       ├── archive/          # Historical data tables
│   │       │   └── brawlhalla/   # Player, legend, weapon, ranked history
│   │       └── auth/             # Auth tables (users, sessions, oauth)
│   └── schema/                   # Shared Effect Schema definitions
│
└── scripts/
    ├── compose.ts                # Docker compose CLI helper
    └── setup/                    # vp run setup bootstrap
```

## API Architecture

The API implements a multi-tier caching and data collection system designed to minimize external API usage while providing fast responses.

### Request Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │────►│   Public API    │────►│  Cache (Redis)  │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │  Cache Miss           │ Cache Hit
                                 ▼                       │ (Stale-While-
                        ┌─────────────────┐              │  Revalidate)
                        │  Rate Limiter   │              │
                        │  (Frontend 30%) │              │
                        └────────┬────────┘              │
                                 │                       │
                                 ▼                       │
                        ┌─────────────────┐              │
                        │  Brawlhalla API │◄─────────────┘
                        │   (External)    │   Background
                        └────────┬────────┘   Revalidation
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │  (Historical)   │
                        └─────────────────┘
```

### Caching Strategy

The API uses a **stale-while-revalidate** pattern:

1. **Cache Hit (Fresh)**: Return cached data immediately
2. **Cache Hit (Stale)**: Return cached data AND trigger background revalidation
3. **Cache Miss**: Fetch from external API (rate limited), cache result

This ensures users never wait on rate limiting if any cached data exists.

### Rate Limiting

The external Brawlhalla API has strict rate limits (10 req/sec, 2000 req/15min). Capacity is split:

| Consumer | Per Second | Per 15 Minutes | Purpose                    |
| -------- | ---------- | -------------- | -------------------------- |
| Frontend | 10 (max)   | 600 (~30%)     | User requests (priority)   |
| Workers  | 7 (max)    | 1400 (~70%)    | Background data collection |

### Background Workers

Two scheduled crawlers run alongside the API server:

#### Leaderboard Crawler (every 10 minutes)

- Crawls 1v1, 2v2, and rotating rankings for all regions
- Stores snapshots in dedicated ranked history tables
- Lightweight: only fetches ranking pages, not player details
- Powers "recently active players" and "ranked queue" endpoints

#### Rankings Crawler (every 6 hours)

- Crawls rankings and fetches full player stats for each player
- Heavy operation: makes individual requests per player
- Populates player history, legend history, weapon history tables
- Powers historical tracking and global rankings

### Database Tables

| Table                     | Purpose                     |
| ------------------------- | --------------------------- |
| `player_history`          | Full player stats snapshots |
| `player_legend_history`   | Per-legend stats over time  |
| `player_weapon_history`   | Per-weapon stats over time  |
| `ranked_1v1_history`      | 1v1 leaderboard snapshots   |
| `ranked_2v2_history`      | 2v2 leaderboard snapshots   |
| `ranked_rotating_history` | Rotating queue snapshots    |
| `player_aliases`          | Player name history         |
| `clan_history`            | Clan/guild snapshots        |

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22.12
- [Docker](https://www.docker.com/) (for PostgreSQL, Redis, and observability stack)

### 1. Bootstrap (recommended)

From the repo root:

```bash
vp install
vp run setup
vp run dev
```

`vp run setup` copies `.env.example` → `.env` when needed, starts Postgres + Redis via compose, installs dependencies, syncs `.repos/`, and runs Drizzle migrations.

Optional Supabase credentials for legacy data migration:

```bash
vp run setup -- --with-supabase
```

### 2. Environment

Root [`.env.example`](.env.example) lists compose defaults (`DATABASE_URL`, `REDIS_URL`, API/client URLs). The API also reads these from the root `.env` when started via `vp run dev`.

### 3. Start Services & Dev Servers

```bash
vp run dev
```

This command:

1. Starts Docker services (PostgreSQL, Redis, observability stack) when not already up
2. Runs database migrations
3. Starts the API server with hot reload
4. Starts the client dev server
5. Opens Drizzle Studio for database inspection

### Application Ports

| Service            | Port  | URL                          | Description         |
| ------------------ | ----- | ---------------------------- | ------------------- |
| **API**            | 3000  | http://localhost:3000        | Backend REST API    |
| **Client**         | 3001  | http://localhost:3001        | Frontend dev server |
| **Drizzle Studio** | 4983  | https://local.drizzle.studio | Database GUI        |
| **PostgreSQL**     | 5432  | -                            | Database            |
| **Redis**          | 6379  | -                            | Cache               |
| **Grafana**        | 3002  | http://localhost:3002        | Observability UI    |
| **Alloy**          | 12345 | http://localhost:12345       | OTEL collector UI   |

### Development Commands

```bash
# Start everything (services + dev servers)
vp run dev

# Docker services
vp run compose:up
vp run compose:down

# Production
vp run server:start
vp run build

# Code quality
vp run lint
vp run check:types
vp run check:lint
vp run check:format
vp run check:deadcode
vp run test

# Database
vp run -F @dair/api db:migrate
vp run -F @dair/api studio

# Localization
vp run -F @dair/client locales:extract
vp run -F @dair/client locales:compile
```

## Observability

### Stack Components

| Service           | Port                                 | Description                  |
| ----------------- | ------------------------------------ | ---------------------------- |
| **Grafana**       | 3002                                 | Visualization and dashboards |
| **Grafana Alloy** | 12345 (UI), 4317 (gRPC), 4318 (HTTP) | OpenTelemetry collector      |
| **Grafana Loki**  | 3100                                 | Log aggregation              |
| **Grafana Tempo** | 3200                                 | Distributed tracing          |

### Grafana Access

- **URL**: http://localhost:3002
- **Username**: `admin`
- **Password**: `correcthorsebatterystaple`

### Configuration Files

- `apps/monitoring/alloy/config.alloy` - OTEL receiver configuration
- `apps/monitoring/loki/loki-config.yaml` - Log storage configuration
- `apps/monitoring/tempo/tempo-config.yaml` - Trace storage configuration
- `apps/monitoring/grafana/provisioning/` - Datasource & dashboard provisioning

## Effect Patterns

This project follows idiomatic Effect patterns. For guidance:

```bash
vp exec npx effect-solutions list         # List all topics
vp exec npx effect-solutions show <slug>  # Read a specific topic
```

Key patterns used:

- **Services**: Effect.Service with `@app/ServiceName` tags and `static readonly layer`
- **Errors**: `Schema.TaggedError` with all properties in the schema
- **Config**: Dedicated config services per domain using Effect Config
