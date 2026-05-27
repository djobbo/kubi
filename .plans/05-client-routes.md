# Phase 5: Client routes (TanStack Start)

**Goal:** Restore corehalla UX on TanStack Router / Start under `apps/client`, consuming `@dair/api-contract` via typed client.

**Prerequisites:** [02-effect-v4-remaining.md](./02-effect-v4-remaining.md) (stable `Api` + Atom client); [04-api-and-auth-parity.md](./04-api-and-auth-parity.md) for bookmarks/auth endpoints used by new routes.

Reference routes: `.repos/corehalla/app/src/routes/`

## Current client surface

| Route                                         | File                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/{locale}/`                                  | [\_sidebar-layout/index.tsx](../apps/client/src/routes/{-$locale}/_sidebar-layout/index.tsx) — placeholder          |
| `/{locale}/brawlhalla/players/$playerId/$tab` | [player route](../apps/client/src/routes/{-$locale}/_sidebar-layout/brawlhalla/players/$playerId/{-$tab}/route.tsx) |
| `/{locale}/brawlhalla/rankings/1v1/...`       | [1v1 route](../apps/client/src/routes/{-$locale}/_sidebar-layout/brawlhalla/rankings/1v1.{-$region}.{-$page}.tsx)   |
| `/{locale}/brawlhalla/rankings/2v2/...`       | [2v2 route](../apps/client/src/routes/{-$locale}/_sidebar-layout/brawlhalla/rankings/2v2.{-$region}.{-$page}.tsx)   |

Shared: [search-command.tsx](../apps/client/src/features/search/components/search-command.tsx) (players only; guild stubbed).

## Route map to add

Suggested path prefix: `/{-$locale}/_sidebar-layout/brawlhalla/...` (consistent with existing player URL).

| Corehalla route       | Kubi route (proposed)                      | API deps                          |
| --------------------- | ------------------------------------------ | --------------------------------- |
| `/` home              | `.../index.tsx` enhance                    | articles, rotation, favorites     |
| `/rankings/1v1/...`   | `.../rankings/1v1.{-$region}.{-$page}.tsx` | `get-ranked-1v1`                  |
| `/rankings/2v2/...`   | `.../rankings/2v2.{-$region}.{-$page}.tsx` | `get-ranked-2v2`                  |
| `/rankings/global`    | `.../rankings/global.tsx`                  | `get-player-rankings`             |
| `/rankings/clans/...` | `.../rankings/clans.{-$page}.tsx`          | **guilds/rankings** (phase 4)     |
| `/rankings/power/...` | `.../rankings/power.$bracket.$region.tsx`  | `get-power-rankings`              |
| `/stats/clan/$id`     | `.../guilds/$guildId/route.tsx`            | `get-guild-by-id`                 |
| `/@me/favorites`      | `.../me/favorites.tsx`                     | bookmarks API (phase 4)           |
| `/stats/me`           | `.../me/index.tsx`                         | session                           |
| `/calc`               | `.../calc.tsx`                             | none (port calculator)            |
| Rotating rankings     | `.../rankings/rotating/...`                | `get-ranked-rotating` (kubi-only) |

### Redirects (low priority)

- [ ] `/p/$playerId` → player canonical URL
- [ ] `/c/$clanId` → guild URL
- [ ] `/leaderboard/*` → 1v1 rankings

### Static / marketing (optional)

- [ ] `wiki`, `discord`, `donate` — port or link out from corehalla

## Player page completion

File: [route.tsx](../apps/client/src/routes/{-$locale}/_sidebar-layout/brawlhalla/players/$playerId/{-$tab}/route.tsx)

| Tab      | Corehalla component | Kubi                     |
| -------- | ------------------- | ------------------------ |
| Overview | `PlayerOverviewTab` | `-overview-tab.tsx` ✓    |
| 2v2      | `Player2v2Tab`      | `-teams-tab.tsx` ✓       |
| Legends  | `PlayerLegendsTab`  | Nav only — **implement** |
| Weapons  | `PlayerWeaponsTab`  | **Missing**              |

- [ ] Port legend/weapon tabs from `.repos/corehalla/app/components/stats/player/`
- [ ] Use data already returned by `get-player-by-id` (legends/weapons in archive/API shape)
- [ ] i18n: run `bun locales:extract` after UI strings added

## Home page

Port `.repos/corehalla/app/views/home.tsx`:

- [ ] Weekly rotation card → `get-weekly-rotation`
- [ ] News/articles → `get-preview-articles`
- [ ] Favorites strip (if session) → bookmarks API
- [ ] Discord CTA (static)

## Search

[search-command.tsx](../apps/client/src/features/search/components/search-command.tsx):

- [ ] Wire guild category to `search-guild`
- [ ] Result links: player vs guild routes
- [ ] Remove TODO at guild result branch

## Layout / chrome

- [ ] Replace placeholder sidebar/header in [\_sidebar-layout/route.tsx](../apps/client/src/routes/{-$locale}/_sidebar-layout/route.tsx)
- [ ] Navigation links to rankings, home, favorites (authed)
- [ ] Match locale routing from [i18n feature](../apps/client/src/features/i18n/)

## Data loading patterns

Follow existing player route:

- TanStack Router loaders + `@effect-atom/atom-react` or shared [api-client](../apps/client/src/shared/api-client.ts)
- SSR/query per TanStack Start docs in `.repos/tanstack-router`

## Suggested implementation order

1. ~~Rankings 1v1 / 2v2~~ (done — API + client routes)
2. Guild profile + search guild wiring
3. Player legends/weapons tabs
4. Home page
5. Global + power rankings
6. Favorites + `/me` (blocked on phase 4)
7. Calc + redirects

## Verification

- [ ] Visual compare key pages with corehalla staging
- [ ] `bun run build` client production build
- [ ] E2E smoke (optional): player, rankings, search

## Depends on

- [04-api-and-auth-parity.md](./04-api-and-auth-parity.md) for clan rankings + bookmarks + session
- API URL env from [01-dev-setup.md](./01-dev-setup.md)
