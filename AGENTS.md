# Agent Instructions

Guidance for AI assistants working on this Brawlhalla statistics platform (dair.gg).

## Vendored upstream (`.repos`)

Trees under `.repos/` are **local shallow clones** of upstream repositories (gitignored, not committed). They are the **source of truth** on disk for how we implement, debug, and document behavior of the matching installed dependencies.

When working on code that uses these libraries:

1. **Read and cite** the vendored tree first — package source, tests, examples, migration notes, and bundled docs inside `.repos` — instead of guessing from npm types alone, third-party summaries, or stale web pages.
2. **Follow patterns** shown in upstream examples and tests in the vendored tree unless this project documents an intentional deviation.
3. **Refresh** vendored copies with `syncVendoredRepos` from [scripts/setup/sync-vendored-repos.mts](scripts/setup/sync-vendored-repos.mts) when you need newer upstream behavior (`vp run setup` runs it automatically; use `{ force: true }` for a clean re-clone). See [.plans/vendored-repos.md](.plans/vendored-repos.md).

| Prefix                   | Upstream                                                                         | Use for npm packages                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `.repos/effect`          | [Effect-TS/effect-smol](https://github.com/Effect-TS/effect-smol) (`main`)       | `effect` and related Effect v4 packages from that monorepo                                               |
| `.repos/tanstack-router` | [TanStack/router](https://github.com/TanStack/router) (`main`)                   | `@tanstack/react-router`, `@tanstack/react-start`, and their workspace siblings in that monorepo         |
| `.repos/tanstack-query`  | [TanStack/query](https://github.com/TanStack/query) (`main`)                     | `@tanstack/react-query`, `@tanstack/query-core`, and their workspace siblings in that monorepo           |
| `.repos/supabase`        | [supabase/supabase](https://github.com/supabase/supabase) (`main`)               | `@supabase/supabase-js`, platform docs, and JS client packages under `packages/` in that monorepo        |
| `.repos/base-ui`         | [mui/base-ui](https://github.com/mui/base-ui) (`master`)                         | `@base-ui/react` and related Base UI packages under `packages/` in that monorepo                         |
| `.repos/vite-plus`       | [voidzero-dev/vite-plus](https://github.com/voidzero-dev/vite-plus) (`main`)     | `vite-plus`, `@voidzero-dev/vite-plus-core`, Oxlint/Oxfmt config, and `vp` CLI behavior                  |
| `.repos/drizzle-orm`     | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) (`main`) | `drizzle-orm`, `drizzle-kit`, and related workspace packages in that monorepo                            |
| `.repos/kubi`            | [djobbo/kubi](https://github.com/djobbo/kubi) (`main`)                           | [dair.gg](https://dair.gg) reference monorepo — API, workers, and packages under `apps/` and `packages/` |
| `.repos/corehalla`       | [djobbo/corehalla](https://github.com/djobbo/corehalla) (`next`)                 | Legacy [corehalla.com](https://corehalla.com) monorepo — Next.js app, tRPC, worker, and packages         |
| `.repos/alchemy`         | [alchemy-run/alchemy](https://github.com/alchemy-run/alchemy) (`main`)           | `alchemy` IaC library, provider resources, examples, and docs in that monorepo                           |
| `.repos/shadcn-ui`       | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) (`main`)                         | `shadcn` CLI, component registry source, templates, and docs in that monorepo                            |

If `.repos/` is missing, run `vp run setup` or `syncVendoredRepos({})` before relying on vendored source. Do not treat vendored trees as editable forks unless the task explicitly requires upstream contributions.

## Toolchain (Vite+)

Monorepo driver: **[vite-plus](https://viteplus.dev)** (`vp`). Package manager: **pnpm**, version pinned in root `packageManager` to match [.repos/vite-plus](.repos/vite-plus). **Dependency versions** are centralized in the pnpm **catalog** ([pnpm-workspace.yaml](pnpm-workspace.yaml)); use `"catalog:"` in `package.json`, not inline semver. See [.plans/07-vite-plus-toolchain.md](.plans/07-vite-plus-toolchain.md).

```bash
vp install           # Install deps (pnpm via vp)
vp run setup         # Bootstrap .env, compose, vendored repos, migrations
vp run dev           # Turbo: API + client + studio
vp run lint          # Format + lint
vp run check:types   # Typecheck all workspaces
vp exec <cmd>        # Run with node_modules/.bin on PATH
```

**Node.js** (≥22) is the runtime for `apps/api`, `apps/workers`, and scripts (`tsx`, `tsx watch`). Use `vp exec tsx …` from root when needed.

## Quick Reference

```bash
# Effect Solutions - ALWAYS check before implementing Effect patterns
vp exec npx effect-solutions list              # List all topics
vp exec npx effect-solutions show <slug...>    # Read specific topics
vp exec npx effect-solutions search <term>     # Search by keyword
```

## Build/Lint/Test Commands

```bash
# Root commands (run from project root)
vp run dev              # Start all services (API, client, DB studio)
vp run build            # Build all packages
vp run lint             # Format (oxfmt) + lint (oxlint) + fix
vp run check:types      # Type check all workspaces
vp run check:deadcode   # Find unused exports (knip)
vp run test             # Run all tests

# Docker services
vp run compose:up       # Start PostgreSQL, Redis
vp run compose:down     # Stop Docker services

# API-specific
vp run -F @dair/api dev
vp run -F @dair/api db:migrate
vp run -F @dair/api studio

# Client-specific
vp run -F @dair/client dev
vp run -F @dair/client build
vp run -F @dair/client locales:extract
vp run -F @dair/client locales:compile
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
import { HttpApiBuilder, HttpClient } from "effect/unstable/http"

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

Use **Effect v4** `Context.Service` with `make` and `Layer.effect` (not `Effect.Service` / `this.Default`).

```typescript
import { Context, Effect, Layer } from "effect"

export class MyService extends Context.Service<MyService>()(
  "@dair/services/MyService",
  {
    make: Effect.gen(function* () {
      const dep = yield* SomeDependency

      return {
        myMethod: Effect.fn("myMethod")(function* (param: string) {
          return yield* dep.doSomething(param)
        }),
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(SomeDependency.layer),
  )
}
```

### Effect Error Pattern (REQUIRED)

```typescript
// ALL properties MUST be in schema - never add class properties
export class MyError extends Schema.TaggedErrorClass<MyError>()("MyError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

// HTTP-specific errors (effect/unstable/httpapi)
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
  api/src/           # Backend (Effect + Node + Drizzle)
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
4. **Use `vp` / pnpm for install and workspace scripts** — not raw `npm`/`yarn`/`bun`; Node + `tsx` for API/worker processes
5. **Never forget Layer.provide** - include all dependencies in static layer

## Testing

```typescript
import { describe, expect, it } from "vitest"

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
