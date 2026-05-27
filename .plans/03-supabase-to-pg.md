# Phase 3: Supabase → on-prem PostgreSQL (Drizzle)

**Goal:** One-time (and idempotent) migration of **user-facing** and **reference** data from corehalla’s Supabase/Prisma DB into kubi’s Drizzle schema, then run the app only against `DATABASE_URL` (compose or production PG).

**Not in scope:** Replicating Supabase Auth as a service — map `auth.users` into kubi `users` / `oauth_accounts` / `sessions` tables.

## Source of truth

| Legacy (corehalla) | Location |
|------------------|----------|
| Prisma schema | `.repos/corehalla/packages/db/prisma/schema.prisma` |
| tRPC + raw SQL | `.repos/corehalla/packages/server/router/` |
| Crawler writes | `.repos/corehalla/worker/src/crawler/` |

| Target (kubi) | Location |
|---------------|----------|
| PG schema | [packages/db/src/schema/](../packages/db/src/schema/) |
| Migrations | [apps/api/migrations/](../apps/api/migrations/) |
| Migrator app | [apps/migrator/](../apps/migrator/) |

## Data mapping

### Must migrate (user/product data)

| Supabase / Prisma | Kubi table(s) | Status |
|-------------------|---------------|--------|
| `BHPlayerAlias` | `brawlhalla_player_aliases` | Started — [aliases.ts](../apps/migrator/src/aliases.ts); fix bugs (see below) |
| `UserFavorite` + `UserProfile` + `auth.users` | `users`, `oauth_accounts`, `bookmarks` | Started — [bookmarks.ts](../apps/migrator/src/bookmarks.ts); **broken imports** |
| `UserConnection` | `oauth_accounts` or metadata JSON | Not started |

### Optional / regenerate via workers

Historical snapshots can be **re-crawled** instead of bulk-imported if acceptable downtime:

| Legacy | Kubi | Recommendation |
|--------|------|----------------|
| `BHPlayerData` (+ legends/weapons) | `player_history`, `player_legend_history`, `player_weapon_history` | Prefer workers after cutover OR import latest row per player only |
| `BHClan` | `clan_history` | Import latest per clan or crawl |
| Ranked leaderboard rows (if stored in Supabase outside Prisma file) | `ranked_*_history` | Prefer `apps/workers` |

### Skip

| Legacy | Reason |
|--------|--------|
| `CrawlProgress` | Kubi workers use different scheduling |
| Supabase Realtime / RLS | Not used on PG stack |

## Blockers to fix first

### 3.1 Bookmarks schema unification

- `@dair/schema` defines `bookmarksTable` as **SQLite** ([packages/schema/src/bookmarks/bookmarks.ts](../packages/schema/src/bookmarks/bookmarks.ts)).
- `apps/api` imports bookmarks from **`@dair/db`** ([bookmarks service](../apps/api/src/services/bookmarks/index.ts)) but **PG tables are not in `packages/db`**.
- [ ] Move bookmarks + `legacy_bookmarks` to `packages/db` as `pgTable` (match [auth schema](../packages/db/src/schema/auth/) style).
- [ ] Generate migration in `apps/api`.
- [ ] Export types from `@dair/db`; trim or alias `@dair/schema` to contract-only DTOs.
- [ ] Fix migrator imports: `@dair/db` not `@/features/...` (corehalla path).

### 3.2 Fix `apps/migrator`

- [ ] [aliases.ts](../apps/migrator/src/aliases.ts): `aliasesTable` typo in `onConflictDoUpdate` → `playerAliasesTable`.
- [ ] [bookmarks.ts](../apps/migrator/src/bookmarks.ts): remove `@/features/bookmarks/constants`; use shared constant from `@dair/common` or `@dair/db`.
- [ ] [env.ts](../apps/migrator/src/env.ts): document `MIGRATION_SUPABASE_URL`, `MIGRATION_SUPABASE_SERVICE_KEY`, `MIGRATION_DATABASE_URL`.
- [ ] Wire `package.json` `"migrate": "bun run src/migrate.ts"`; add to turbo if needed.
- [ ] Convert to Effect service (optional, after phase 2) with `Effect.fn`, retries, structured logging.

### 3.3 Supabase client types

- [ ] Regenerate [database.types.ts](../apps/migrator/src/database.types.ts) from legacy project or maintain hand-written subset for `BHPlayerAlias`, `UserFavorite`, views used in bookmarks SQL.

## Migrator pipeline (ordered)

```bash
# Prerequisites: target PG up, Drizzle migrations applied, Supabase creds in env
cd apps/migrator
bun run migrate
```

Recommended order inside [migrate.ts](../apps/migrator/src/migrate.ts):

1. **Users + OAuth** — Discord (and other) providers from `auth.users` / `UserProfile`
2. **Aliases** — batched `BHPlayerAlias`
3. **Bookmarks** — `UserFavorite` → `bookmarks` (dedupe by userId + pageId + pageType)
4. **Legacy bookmark migration flag** — call same logic as API `Bookmarks.migrateLegacyBookmarks` for session login path
5. *(Optional)* **Latest player/clan snapshot** — one row per id into history tables

- [ ] Add CLI flags: `--only=aliases,bookmarks`, `--dry-run`, `--batch-size`.
- [ ] Idempotency: all inserts use `onConflictDoUpdate` / `onConflictDoNothing`.
- [ ] Progress logging + row counts; persist checkpoint table optional.

## Bookmarks SQL reference

Corehalla migrator used a Supabase RPC/view for favorites + profiles. Document the exact query in migrator README after reading `.repos/corehalla` migrator or server scripts (search `UserFavorite`, `favorite_data`).

## Auth migration notes

- Map Supabase `auth.users.id` (UUID) → kubi `users.id`.
- `raw_app_meta_data.provider` → `oauth_accounts.provider`.
- Pre-migration Discord prefix constant must match API [bookmarks service](../apps/api/src/services/bookmarks/index.ts) `migrateLegacyBookmarks`.

## Verification

- [ ] Row counts: aliases, users, bookmarks within ±1% of Supabase counts.
- [ ] Spot-check 10 users: favorites visible after login.
- [ ] Spot-check aliases on player pages (public search).
- [ ] No migrator run required on empty fresh dev DB.

## Production cutover

See [06-cutover-and-ops.md](./06-cutover-and-ops.md): freeze writes on corehalla, run migrator, verify, switch DNS.

## Env vars (migrator)

| Variable | Purpose |
|----------|---------|
| `MIGRATION_DATABASE_URL` | Target PG (kubi) |
| `MIGRATION_SUPABASE_URL` | Legacy API URL |
| `MIGRATION_SUPABASE_SERVICE_KEY` | Service role for read |

Do **not** commit keys; use `.env` locally and CI secrets for one-off jobs.
