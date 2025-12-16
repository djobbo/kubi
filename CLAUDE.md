# Agent Instructions

This document provides comprehensive guidance for AI assistants working on this codebase.

## Quick Reference

```bash
# Effect Solutions - ALWAYS check before implementing Effect patterns
bunx effect-solutions list              # List all topics
bunx effect-solutions show <slug...>    # Read specific topics
bunx effect-solutions search <term>     # Search by keyword

# Effect Source Reference (for advanced usage)
~/.local/share/effect-solutions/effect  # Local Effect repo clone
```

## Effect Solutions Usage

The Effect Solutions CLI provides curated best practices and patterns for Effect TypeScript. **Before implementing any Effect code, check if there's a relevant topic.**

### Available Topics

| Topic                 | Description                                      |
| --------------------- | ------------------------------------------------ |
| `quick-start`         | How to get started with Effect Solutions         |
| `project-setup`       | Effect Language Service and project setup        |
| `tsconfig`            | TypeScript configuration for Effect              |
| `basics`              | Effect.fn and Effect.gen conventions             |
| `services-and-layers` | Dependency injection patterns                    |
| `data-modeling`       | Schema classes, unions, brands, pattern matching |
| `error-handling`      | Error modeling and handling patterns             |
| `config`              | Configuration management                         |

### When to Use Effect Solutions

- Before implementing new Effect patterns
- When encountering Effect-related errors
- When designing services, layers, or error types
- When working with Effect Schema or Config
- When unsure about Effect conventions

---

## Project Overview

**dair.gg** - A Brawlhalla statistics platform with:

- Real-time player stats and rankings
- Historical data tracking
- Background data crawlers
- Multi-tier caching system

## Tech Stack

| Component     | Technology                               |
| ------------- | ---------------------------------------- |
| Runtime       | Bun v1.3.4                               |
| Monorepo      | Turborepo                                |
| Backend       | Effect + @effect/platform + Drizzle ORM  |
| Frontend      | React 19 + TanStack Router + TailwindCSS |
| Database      | PostgreSQL                               |
| Cache         | Redis (LRU)                              |
| Observability | OpenTelemetry + Grafana Stack            |

---

## Effect Patterns (This Project)

### Service Pattern

Every service follows this structure:

```typescript
import { Effect, Layer, Config } from "effect"

export class MyService extends Effect.Service<MyService>()(
  "@dair/services/MyService",  // Tag convention: @dair/services/<Name>
  {
    effect: Effect.gen(function* () {
      // Yield dependencies
      const config = yield* MyConfig
      const db = yield* Database

      // Return service object
      return {
        myMethod: Effect.fn("myMethod")(function* (param: string) {
          // Implementation using Effect.gen
          return yield* db.query(...)
        }),
      }
    }),
  },
) {
  // Static layer that includes all dependencies
  static readonly layer = this.Default.pipe(
    Layer.provide(MyConfig.layer),
    Layer.provide(Database.layer),
  )
}
```

### Error Pattern

Errors use `Schema.TaggedError` with ALL properties in the schema:

```typescript
import { Schema } from "effect"

// ✅ Correct: All properties in schema definition
export class MyError extends Schema.TaggedError<MyError>(
  "MyError",
)("MyError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  status: Schema.Number.pipe(Schema.optionalWith({ default: () => 500 })),
}) {}

// ❌ Wrong: Properties outside schema
export class BadError extends Schema.TaggedError<BadError>(
  "BadError",
)("BadError", {
  message: Schema.String,
}) {
  status = 500  // DON'T DO THIS
}
```

### HTTP API Error Pattern

For HTTP-specific errors:

```typescript
import { HttpApiSchema } from "@effect/platform"

export class TooManyRequests extends HttpApiSchema.EmptyError<TooManyRequests>()({
  tag: "TooManyRequests",
  status: 429,
}) {}
```

### Config Pattern

Dedicated config services per domain:

```typescript
import { Config, Effect, Layer, Redacted } from "effect"

export class MyConfig extends Effect.Service<MyConfig>()(
  "@dair/services/MyConfig",
  {
    effect: Effect.gen(function* () {
      return {
        url: yield* Config.nonEmptyString("MY_URL"),
        secret: yield* Config.redacted("MY_SECRET"),
        port: yield* Config.number("MY_PORT").pipe(Config.withDefault(3000)),
      }
    }),
  },
) {
  static readonly layer = this.Default
  static readonly testLayer = Layer.succeed(this, {
    url: "http://test",
    secret: Redacted.make("test-secret"),
    port: 3000,
  })
}
```

### Route Handler Pattern

Using @effect/platform HttpApi:

```typescript
// In api-contract package - define the contract
class MyGroup extends HttpApiGroup.make("myGroup")
  .add(
    HttpApiEndpoint.get("myEndpoint")`/path/${idParam}`
      .addSuccess(ResponseSchema)
      .addError(NotFound)
      .addError(InternalServerError),
  ) {}

// In api app - implement the handler
const MyGroupLive = HttpApiBuilder.group(Api, "myGroup", (handlers) =>
  handlers.handle(
    "myEndpoint",
    Effect.fn("myEndpoint")(
      function* ({ path }) {
        return yield* myService.getData(path.id)
      },
      flow(
        Effect.tapError(Effect.logError),
        Effect.catchTags({
          MyNotFoundError: () => Effect.fail(new NotFound()),
          MyApiError: () => Effect.fail(new InternalServerError()),
        }),
      ),
    ),
  ),
)
```

---

## Current Implementations Reference

### Services (apps/api/src/services/)

| Service                 | File                      | Description                             |
| ----------------------- | ------------------------- | --------------------------------------- |
| `BrawlhallaApi`         | `brawlhalla-api/index.ts` | External API client with rate limiting  |
| `Archive`               | `archive/index.ts`        | Historical data storage (PostgreSQL)    |
| `Authorization`         | `authorization/index.ts`  | OAuth (Discord, Google) + sessions      |
| `Cache`                 | `cache/index.ts`          | Redis cache with stale-while-revalidate |
| `Database`              | `db/index.ts`             | Drizzle ORM PostgreSQL client           |
| `Fetcher`               | `fetcher/index.ts`        | HTTP client with caching strategies     |
| `BrawlhallaRateLimiter` | `rate-limiter/index.ts`   | Dual rate limiter (frontend/worker)     |

### BrawlhallaApi Service

Two sets of methods with different rate limiting:

```typescript
// Frontend methods (30% of capacity, cache-first)
brawlhallaApi.getPlayerStatsById(playerId)
brawlhallaApi.getPlayerRankedById(playerId)
brawlhallaApi.getRankings1v1(region, page)
brawlhallaApi.getClanById(clanId)
brawlhallaApi.getAllLegendsData()

// Worker methods (70% of capacity, direct fetch)
brawlhallaApi.worker.getPlayerStatsById(playerId)
brawlhallaApi.worker.getRankings1v1(region, page)
// ... same methods under .worker namespace
```

### Rate Limiter Service

External API limits: 10 req/sec, 2000 req/15min

```typescript
const rateLimiter = yield* BrawlhallaRateLimiter

// For user requests (priority, 30% capacity)
yield* rateLimiter.limitFrontend(apiCall)

// For background workers (conservative, 70% capacity)
yield* rateLimiter.limitWorker(apiCall)

// Check current status
const status = yield* rateLimiter.getStatus
```

### Cache Service

Redis-backed with stale-while-revalidate:

```typescript
const cache = yield* Cache

// Simple get/set
yield* cache.get(key, schema)
yield* cache.set(key, value, Option.some(Duration.minutes(5)))

// Get or set with lazy computation
yield* cache.getOrSet(key, schema, lazyEffect, ttl)
```

### Fetcher Service

HTTP client with caching strategies:

```typescript
const fetcher = yield* Fetcher

// Simple fetch (workers)
yield* fetcher.fetchJson(schema, { method: "GET", url, cacheName })

// Cache-first with background revalidation (frontend)
yield* fetcher.fetchJsonCacheFirst(schema, {
  method: "GET",
  url,
  cacheName,
  rateLimitedFetch: rateLimiter.limitFrontend,
  staleMaxAge: 3600,  // 1 hour
})
```

### Archive Service

Historical data operations:

```typescript
const archive = yield* Archive

// Player data
yield* archive.addPlayerHistory(playerData, rawStats, rawRanked)
yield* archive.getPlayerHistory(playerId, limit, offset)
yield* archive.addAliases([{ playerId, alias, public: true }])
yield* archive.getAliases(playerId)

// Ranked history (from leaderboard crawler)
yield* archive.addRanked1v1History(entries)
yield* archive.addRanked2v2History(entries)
yield* archive.addRankedRotatingHistory(entries)

// Active player queries
yield* archive.getRecentlyActiveRanked1v1Players({ region, windowMinutes: 15, limit: 50 })

// Search
yield* archive.searchPlayers(name, cursor, pageSize)

// Global rankings
yield* archive.getGlobalPlayerRankings(sortField, offset, limit)
yield* archive.getGlobalLegendRankings(legendId, sortField, offset, limit)
```

### Background Workers

Two crawlers run alongside the API server:

```typescript
// Leaderboard crawler (every 10 min) - lightweight
// apps/api/src/workers/leaderboard-crawler.ts
// - Crawls ranking pages for all regions
// - Stores in ranked_*_history tables
// - Powers "ranked queues" endpoint

// Rankings crawler (every 6 hours) - heavy
// apps/api/src/workers/rankings-crawler.ts
// - Crawls rankings AND fetches full player stats
// - Stores in player_history, legend_history, weapon_history
// - Powers historical tracking & global rankings
```

---

## Database Schema (packages/db/)

### Archive Tables

| Table                     | Key Columns                                             |
| ------------------------- | ------------------------------------------------------- |
| `player_history`          | playerId, name, xp, games, wins, ranked stats, raw JSON |
| `player_legend_history`   | playerId, legendId, games, wins, xp, rating             |
| `player_weapon_history`   | playerId, weaponName, games, wins, kos                  |
| `ranked_1v1_history`      | playerId, rank, rating, peakRating, tier, region        |
| `ranked_2v2_history`      | playerIdOne, playerIdTwo, rank, rating, tier            |
| `ranked_rotating_history` | playerId, rank, rating, tier, region                    |
| `player_aliases`          | playerId, alias, recordedAt, public                     |
| `clan_history`            | clanId, name, xp, membersCount                          |

### Auth Tables

| Table            | Key Columns                         |
| ---------------- | ----------------------------------- |
| `users`          | id, email, username, avatarUrl      |
| `sessions`       | id, userId, expiresAt               |
| `oauth_accounts` | userId, provider, providerAccountId |

### Schema Pattern

Tables use hybrid approach: frequently queried fields as columns, rest in JSONB:

```typescript
export const playerHistoryTable = pgTable(
  "brawlhalla_player_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    ...withRecordedAt,  // Adds recordedAt timestamp

    // Extracted columns for queries
    name: text("name").notNull(),
    xp: bigint("xp", { mode: "number" }).notNull(),
    // ...

    // JSONB for everything else
    rawStatsData: jsonb("raw_stats_data").$type<unknown>(),
    rawRankedData: jsonb("raw_ranked_data").$type<unknown>(),
  },
  (table) => [
    index("idx_...").on(table.playerId, table.recordedAt),
    // ... more indexes
  ],
)
```

---

## API Contract (packages/api-contract/)

Defines typed API contracts shared between frontend and backend:

```typescript
// packages/api-contract/src/index.ts
export const Api = HttpApi.make("Api")
  .add(HealthGroup.prefix("/health"))
  .add(BrawlhallaGroup.prefix("/brawlhalla"))
  .add(AuthGroup.prefix("/auth"))
  .prefix("/v1")
```

### Endpoint Definitions

```typescript
class BrawlhallaGroup extends HttpApiGroup.make("brawlhalla")
  .add(
    HttpApiEndpoint.get("get-player-by-id")`/players/${idParam}`
      .addSuccess(GetPlayerByIdResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  // ...more endpoints
```

---

## File Structure

```
dair/
├── apps/
│   ├── api/src/
│   │   ├── services/     # Business logic (Effect services)
│   │   ├── routes/       # Route handlers
│   │   └── workers/      # Background crawlers
│   ├── client/src/       # React frontend
│   └── monitoring/       # Grafana stack config
├── packages/
│   ├── api-contract/     # Shared API types
│   ├── db/               # Drizzle schema
│   ├── brawlhalla-api/   # Game API types & helpers
│   ├── common/           # Shared utilities
│   └── schema/           # Effect Schema definitions
└── scripts/              # Build & migration helpers
```

---

## Development Commands

```bash
# Start everything
bun dev

# Docker services only
bun compose up
bun compose down

# Code quality
bun lint              # Format + lint + fix
bun check:types       # Type check all workspaces
bun check:deadcode    # Find unused exports

# Database (from apps/api)
bun db:migrate        # Generate + apply migrations
bun studio            # Open Drizzle Studio

# Localization (from apps/client)
bun locales:extract   # Extract i18n strings
bun locales:compile   # Compile translations
```

---

## Cursor Rules

See `.cursor/rules/` for detailed patterns:

- `effect-patterns.mdc` - Effect service/error patterns
- `api-architecture.mdc` - Caching, rate limiting, workers
- `database.mdc` - Drizzle schema patterns
- `project-structure.mdc` - Workspace organization
- `bun-runtime.mdc` - Bun usage guidelines

---

## Important Notes

1. **Always use Effect.fn for service methods** - Enables tracing and proper error handling
2. **Never add properties to TaggedError classes** - All properties must be in the schema
3. **Use @dair/services/<Name> tag convention** - Consistent service identification
4. **Rate limiter is shared** - Workers and server use the same instance with separate pools
5. **Cache uses stale-while-revalidate** - Users never wait on rate limits if cache exists
6. **Check Effect Solutions first** - Run `bunx effect-solutions show <topic>` before implementing patterns
