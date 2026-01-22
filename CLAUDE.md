# Agent Instructions

Guidance for AI assistants working on this Brawlhalla statistics platform (dair.gg).

## Quick Reference

```bash
# Effect Solutions - ALWAYS check before implementing Effect patterns
bunx effect-solutions list              # List all topics
bunx effect-solutions show <slug...>    # Read specific topics (basics, services-and-layers, error-handling, config)
bunx effect-solutions search <term>     # Search by keyword
```

## Build/Lint/Test Commands

```bash
# Root commands (run from project root)
bun dev              # Start all services (API, client, DB studio)
bun build            # Build all packages
bun lint             # Format (oxfmt) + lint (oxlint) + fix
bun check:types      # Type check all workspaces
bun check:deadcode   # Find unused exports (knip)
bun test             # Run all tests

# Run single test file
bun test path/to/file.test.ts
bun test --watch path/to/file.test.ts  # Watch mode

# Docker services
bun compose up       # Start PostgreSQL, Redis
bun compose down     # Stop Docker services

# API-specific (from apps/api)
bun dev              # API with hot reload
bun db:migrate       # Generate + apply migrations
bun studio           # Open Drizzle Studio

# Client-specific (from apps/client)
bun dev              # Vite dev server
bun build            # Production build
bun locales:extract  # Extract i18n strings
bun locales:compile  # Compile translations
```

## Code Style Guidelines

### Formatting (oxfmt - Prettier-compatible)

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "printWidth": 80,
  "arrowParens": "always"
}
```

### Imports

```typescript
// Effect imports - use named imports from "effect"
import { Effect, Layer, Config, Schema, Duration, Option, flow } from "effect"
import { HttpApiBuilder, HttpClient } from "@effect/platform"

// Internal packages - use workspace:* protocol
import { Api } from "@dair/api-contract"
import { playerHistoryTable } from "@dair/db"
import { cleanString } from "@dair/common/src/helpers/clean-string"

// API app uses @/ alias for src/
import { Archive } from "@/services/archive"
import { BrawlhallaApi } from "@/services/brawlhalla-api"
```

### Naming Conventions

| Type     | Convention                               | Example                                  |
| -------- | ---------------------------------------- | ---------------------------------------- |
| Services | PascalCase, tag: `@dair/services/<Name>` | `BrawlhallaApi`, `Archive`               |
| Errors   | PascalCase with Error suffix             | `BrawlhallaPlayerNotFound`               |
| Tables   | camelCase + Table suffix                 | `playerHistoryTable`                     |
| Config   | PascalCase + Config suffix               | `DatabaseConfig`                         |
| Files    | kebab-case                               | `brawlhalla-api.ts`, `player-history.ts` |

### Effect Service Pattern (REQUIRED)

```typescript
export class MyService extends Effect.Service<MyService>()(
  "@dair/services/MyService", // Tag convention
  {
    effect: Effect.gen(function* () {
      const dep = yield* SomeDependency

      return {
        // ALL methods use Effect.fn for tracing
        myMethod: Effect.fn("myMethod")(function* (param: string) {
          return yield* dep.doSomething(param)
        }),
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(Layer.provide(SomeDependency.layer))
}
```

### Effect Error Pattern (REQUIRED)

```typescript
// ALL properties MUST be in schema - never add class properties
export class MyError extends Schema.TaggedError<MyError>("MyError")("MyError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  status: Schema.Number.pipe(Schema.optionalWith({ default: () => 500 })),
}) {}

// HTTP-specific errors
export class NotFound extends HttpApiSchema.EmptyError<NotFound>()({
  tag: "NotFound",
  status: 404,
}) {}
```

### Error Handling Pattern

```typescript
Effect.fn("myOperation")(
  function* () {
    return yield* riskyOperation()
  },
  flow(
    Effect.tapError(Effect.logError),
    Effect.catchTags({
      NotFoundError: () => Effect.fail(new NotFound()),
      RateLimitError: () => Effect.fail(new TooManyRequests()),
    }),
  ),
)
```

### Database Schema Pattern

```typescript
export const playerHistoryTable = pgTable(
  "brawlhalla_player_history",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`), // UUIDv7 for time-sorting
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    ...withRecordedAt, // Adds recordedAt timestamp
    name: text("name").notNull(),
    rawStatsData: jsonb("raw_stats_data").$type<unknown>(), // JSONB for complex data
  },
  (table) => [
    index("idx_player_history_recorded").on(table.playerId, table.recordedAt),
  ],
)
```

## Project Structure

```
apps/
  api/src/           # Backend (Effect + Bun + Drizzle)
    services/        # Business logic (Effect services)
    routes/          # HTTP handlers
    workers/         # Background crawlers
  client/src/        # Frontend (React + TanStack Router)
packages/
  api-contract/      # Shared API types (HttpApi contracts)
  db/                # Drizzle schema
  brawlhalla-api/    # Game API types
  common/            # Shared utilities
```

## Anti-Patterns to Avoid

1. **Never add class properties to TaggedError** - all properties in schema
2. **Never skip Effect.fn for service methods** - required for tracing
3. **Never use raw promises** - wrap in Effect
4. **Never use node/npm/pnpm** - use bun exclusively
5. **Never forget Layer.provide** - include all dependencies in static layer

## Testing

```typescript
import { test, expect, describe } from "bun:test"

describe("MyService", () => {
  test("does something", () => {
    expect(1 + 1).toBe(2)
  })
})
```

## Key Architecture Notes

- **Cache strategy**: Stale-while-revalidate with database fallback
  1. Check Redis cache first
  2. On cache miss, fetch from external Brawlhalla API
  3. On API failure, fallback to PostgreSQL archive
- **Workers**: Leaderboard crawler (10 min), Rankings crawler (6 hours)
- **Database**: PostgreSQL with JSONB for complex data, UUIDv7 for IDs
