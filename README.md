# dair.gg

A Brawlhalla statistics and analytics platform built with Effect, featuring real-time player stats, rankings, and historical data tracking.

## Tech Stack

| Component       | Technology                                         |
| --------------- | -------------------------------------------------- |
| Package Manager | Bun (v1.3.4)                                       |
| Monorepo        | Turborepo                                          |
| Backend         | Bun + Effect + @effect/platform                    |
| Frontend        | React 19 + Vite + TanStack Start + TailwindCSS     |
| Database        | PostgreSQL + Drizzle ORM                           |
| Observability   | OpenTelemetry + Grafana Stack (Alloy, Loki, Tempo) |
| i18n            | Lingui                                             |
| Type Safety     | TypeScript + Effect Schema                         |

## Project Structure

```
kubi/
├── apps/
│   ├── api/           # Backend API server (Bun + Effect)
│   ├── client/        # Frontend application (React + Vite)
│   └── monitoring/    # Grafana observability config
├── packages/
│   ├── api-contract/      # API route contracts (shared types)
│   ├── brawlhalla-api/    # Brawlhalla API types & helpers
│   ├── brawlhalla-replays/# Replay file parser
│   ├── brawlhalla-servers/# Server location data
│   ├── common/            # Shared utilities
│   ├── db/                # Database schema (Drizzle)
└── scripts/           # Build & migration scripts
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.4
- [Docker](https://www.docker.com/) (for PostgreSQL + observability stack)

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Create `.env` files for the API (in `apps/api/.env`):

```bash
# Required
API_URL=http://localhost:3000
DATABASE_URL=postgresql://dair:dair@localhost:5432/dair
DATABASE_CACHE_VERSION=1
DEFAULT_CLIENT_URL=http://localhost:3001
BRAWLHALLA_API_KEY=your_api_key_here

# OAuth (required for authentication)
OAUTH_SECRET=your_random_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional
API_PORT=3000                      # default: 3000
ALLOWED_ORIGINS=*                  # default: * (comma-separated)
OTLP_ENDPOINT=http://localhost:4318
SERVICE_NAME=api
SERVICE_VERSION=0.0.0
```

### 3. Start Services & Dev Servers

```bash
bun dev
```

This command:

1. Starts Docker services (PostgreSQL + observability stack)
2. Runs database migrations
3. Starts the API server (with hot reload)
4. Starts the client dev server
5. Opens Drizzle Studio for database inspection

## Application Ports

| Service            | Port | URL                          | Description         |
| ------------------ | ---- | ---------------------------- | ------------------- |
| **API**            | 3000 | http://localhost:3000        | Backend REST API    |
| **Client**         | 3001 | http://localhost:3001        | Frontend dev server |
| **Drizzle Studio** | 4983 | https://local.drizzle.studio | Database GUI        |
| **PostgreSQL**     | 5432 | -                            | Database            |

## Development Commands

```bash
# Start everything (services + dev servers)
bun dev

# Individual commands
bun compose up         # Start Docker services only
bun compose down       # Stop Docker services
bun server:start       # Start API in production mode
bun build              # Build all packages
bun test               # Run tests

# Code quality
bun lint               # Format + lint + fix
bun check:types        # Type checking
bun check:lint         # Lint only
bun check:format       # Format check
bun check:deadcode     # Find unused exports

# Database (run from apps/api)
bun db:migrate         # Generate + apply migrations
bun studio             # Open Drizzle Studio
```

## Environment Variables Reference

### API Server

| Variable                 | Required | Default | Description                      |
| ------------------------ | -------- | ------- | -------------------------------- |
| `API_URL`                | ✅       | -       | Public URL of the API            |
| `API_PORT`               | ❌       | `3000`  | Port to run the API on           |
| `ALLOWED_ORIGINS`        | ❌       | `*`     | CORS allowed origins (comma-sep) |
| `DATABASE_URL`           | ✅       | -       | PostgreSQL connection string     |
| `DATABASE_CACHE_VERSION` | ✅       | -       | Cache invalidation version       |
| `DEFAULT_CLIENT_URL`     | ✅       | -       | Client app URL for redirects     |
| `BRAWLHALLA_API_KEY`     | ✅       | -       | Brawlhalla API key               |

### OAuth

| Variable                | Required | Description              |
| ----------------------- | -------- | ------------------------ |
| `OAUTH_SECRET`          | ✅       | Secret for token signing |
| `DISCORD_CLIENT_ID`     | ✅       | Discord OAuth app ID     |
| `DISCORD_CLIENT_SECRET` | ✅       | Discord OAuth secret     |
| `GOOGLE_CLIENT_ID`      | ✅       | Google OAuth app ID      |
| `GOOGLE_CLIENT_SECRET`  | ✅       | Google OAuth secret      |

### Observability

| Variable          | Required | Default                 | Description               |
| ----------------- | -------- | ----------------------- | ------------------------- |
| `OTLP_ENDPOINT`   | ❌       | `http://localhost:4318` | OTLP HTTP endpoint        |
| `SERVICE_NAME`    | ❌       | `api`                   | Service name in traces    |
| `SERVICE_VERSION` | ❌       | `0.0.0`                 | Service version in traces |

---

## Instrumentation

The project uses a Grafana-based observability stack for monitoring, logging, and tracing.

### Stack Components

| Service           | Port                                 | Description                  |
| ----------------- | ------------------------------------ | ---------------------------- |
| **Grafana**       | 3002                                 | Visualization and dashboards |
| **Grafana Alloy** | 12345 (UI), 4317 (gRPC), 4318 (HTTP) | OpenTelemetry collector      |
| **Grafana Loki**  | 3100                                 | Log aggregation              |
| **Grafana Tempo** | 3200                                 | Distributed tracing          |

### Architecture

```
┌─────────────┐     OTLP/HTTP      ┌─────────────┐
│   API       │ ─────────────────► │   Alloy     │
│  (traces)   │    :4318           │  (collector)│
└─────────────┘                    └──────┬──────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                          ▼               ▼               ▼
                    ┌─────────┐     ┌─────────┐     ┌─────────┐
                    │  Loki   │     │  Tempo  │     │ Grafana │
                    │ (logs)  │     │(traces) │     │  (UI)   │
                    └─────────┘     └─────────┘     └─────────┘
```

### Starting the Stack

```bash
bun compose up
```

### Access

- **Grafana**: http://localhost:3002
  - Username: `admin`
  - Password: `correcthorsebatterystaple`
- **Alloy UI**: http://localhost:12345
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200

### Configuration Files

- `apps/monitoring/alloy/config.alloy` - Alloy OTEL receiver configuration
- `apps/monitoring/loki/loki-config.yaml` - Loki storage configuration
- `apps/monitoring/tempo/tempo-config.yaml` - Tempo storage configuration
- `apps/monitoring/grafana/provisioning/` - Grafana datasource provisioning

### API Integration

The API automatically sends telemetry to Alloy via OpenTelemetry. Configure via environment variables:

| Variable          | Default                 | Description               |
| ----------------- | ----------------------- | ------------------------- |
| `OTLP_ENDPOINT`   | `http://localhost:4318` | OTLP HTTP endpoint        |
| `SERVICE_NAME`    | `api`                   | Service name in traces    |
| `SERVICE_VERSION` | `0.0.0`                 | Service version in traces |

---

## Development Notes

### Effect Patterns

This project follows idiomatic Effect patterns. For guidance, use:

```bash
bunx effect-solutions list         # List all topics
bunx effect-solutions show <slug>  # Read a specific topic
```

### Hot Reload

- **API**: Uses `bun --watch` for automatic restart on file changes
- **Client**: Uses Vite HMR for instant updates

### Database Migrations

Database schema lives in `packages/db/src/schema/`. After making changes:

```bash
cd apps/api
bun db:migrate
```

### Internationalization

The client uses Lingui for i18n. To update translations:

```bash
cd apps/client
bun locales:extract   # Extract strings from code
bun locales:compile   # Compile translation files
```
