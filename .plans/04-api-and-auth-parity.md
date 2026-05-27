# Phase 4: API and auth parity (vs corehalla tRPC)

**Goal:** HTTP API covers everything the Next/tRPC app exposed, with real sessions and bookmarks.

**Prerequisites:** [02-effect-v4-remaining.md](./02-effect-v4-remaining.md) § 2b.1–2b.2 (`vp run -F @dair/api check:types` green). Bookmarks HTTP needs `Bookmarks` on `Context.Service` (§ 2b.1).

Reference router: `.repos/corehalla/packages/server/router/index.ts`

## Already at parity (or better)

| Corehalla tRPC                       | Kubi endpoint                      | Notes                                    |
| ------------------------------------ | ---------------------------------- | ---------------------------------------- |
| `getPlayerStats` + `getPlayerRanked` | `get-player-by-id`                 | Merged response                          |
| `get1v1Rankings` / `get2v2Rankings`  | `get-ranked-1v1`, `get-ranked-2v2` | + rotating                               |
| `getPowerRankings`                   | `get-power-rankings`               |                                          |
| `getGlobalPlayerRankings`            | `get-player-rankings`              |                                          |
| `getWeeklyRotation`                  | `get-weekly-rotation`              |                                          |
| `getBHArticles`                      | `get-preview-articles`             |                                          |
| `getClanStats`                       | `get-guild-by-id`                  |                                          |
| `searchPlayerAlias`                  | `search-player`                    | Archive-backed; verify alias table usage |
| Queue snapshots                      | `get-ranked-*-queue`               | New vs corehalla                         |

## Gaps to implement

### 4.1 Clan rankings API

`search-guild` already exposes archive-backed clan rankings (`Archive.searchGuilds`). Optional alias endpoint only if clients need a dedicated path.

- [ ] Decide: keep `GET /v1/brawlhalla/guilds/search` only, or add `GET /v1/brawlhalla/guilds/rankings` alias
- [x] Port logic from corehalla `getClansRankings` → [search-guild.ts](../apps/api/src/routes/v1/brawlhalla/search-guild.ts) + archive
- [ ] Client clans rankings page → `search-guild` (phase 5)

### 4.2 Bookmarks HTTP API

Service exists: [apps/api/src/services/bookmarks/index.ts](../apps/api/src/services/bookmarks/index.ts) — **no routes**.

- [ ] Add `BookmarksGroup` to api-contract: list, create, delete (and optional migrate-legacy POST)
- [ ] Handlers under `apps/api/src/routes/v1/bookmarks/` (or auth namespace)
- [ ] Require session via `Authorization` service
- [ ] Complete phase 3 PG schema before implementation

### 4.3 Real auth session

[get-session](../packages/api-contract/src/routes/v1/auth/get-session.ts) and handlers use stubs.

- [ ] `get_session` returns user + session from cookie / DB
- [ ] `delete_session`, `logout` clear cookie + DB row
- [ ] OAuth callback creates session ([session.ts](../apps/api/src/services/authorization/session.ts))
- [ ] Rankings endpoints with `// TODO: Authorization.getSession()` — decide public vs authed tier visibility

### 4.4 Player response bookmarks

Contract already has `bookmark: Schema.NullOr(Bookmark)` on player/guild responses with TODO.

- [ ] Resolve bookmark for current session in `get-player-by-id`, `get-guild-by-id`
- [ ] Share bookmark DTO between contract and `@dair/db`

### 4.5 Search improvements

- [ ] `search-player`: optionally search `player_aliases` table explicitly
- [ ] Document difference vs corehalla alias search

## Auth parity checklist

| Feature        | Corehalla     | Kubi                                                              |
| -------------- | ------------- | ----------------------------------------------------------------- |
| Discord OAuth  | Supabase Auth | Arctic + [authorization](../apps/api/src/services/authorization/) |
| Google OAuth   | —             | Config present                                                    |
| Session cookie | Supabase      | Custom `sessions` table                                           |
| Favorites      | DB + RLS      | Bookmarks service (needs HTTP + PG)                               |

## Testing

- [ ] Contract tests or `bun test` handler tests with mocked Archive / BH API
- [ ] Manual: OAuth flow on localhost, bookmark CRUD, clan rankings page data

## Depends on

- [03-supabase-to-pg.md](./03-supabase-to-pg.md) for bookmarks/users data
- [02-effect-v4.md](./02-effect-v4.md) recommended before large handler work
