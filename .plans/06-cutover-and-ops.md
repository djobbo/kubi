# Phase 6: Cutover and operations

**Goal:** Run kubi in production on on-prem PostgreSQL + Redis; decommission corehalla Supabase for application data.

## Pre-cutover checklist

- [ ] [01-dev-setup.md](./01-dev-setup.md) — reproducible bootstrap
- [ ] [02-effect-v4.md](./02-effect-v4.md) — stable runtime
- [ ] [03-supabase-to-pg.md](./03-supabase-to-pg.md) — migrator tested on staging snapshot
- [ ] [04-api-and-auth-parity.md](./04-api-and-auth-parity.md) — bookmarks + session + clan rankings
- [ ] [05-client-routes.md](./05-client-routes.md) — critical user journeys
- [ ] Workers running ([apps/workers](../apps/workers/)): leaderboard + player crawl
- [ ] `BRAWLHALLA_API_KEY`, OAuth secrets, `DATABASE_URL`, `REDIS_URL` in prod secrets
- [ ] Observability: [apps/monitoring](../apps/monitoring/) Alloy → Tempo/Loki/Grafana

## Staging rehearsal

1. Restore Supabase **read-only** snapshot or replica.
2. Point `MIGRATION_*` env at snapshot; `DATABASE_URL` at staging PG.
3. Run migrator; validate counts and spot-checks (phase 3).
4. Deploy API + workers + client to staging.
5. Soak test: rankings crawl, player lookup, login, favorites.

## Cutover window (suggested)

| Step | Action |
|------|--------|
| T-24h | Freeze corehalla deploys; announce maintenance |
| T-1h | Scale workers down on corehalla; final Supabase export if needed |
| T0 | Maintenance mode on corehalla |
| T0 | Run migrator against production PG |
| T0 | Deploy kubi API + workers + client |
| T+1h | Smoke tests; monitor rate limits + error rate |
| T+24h | Keep Supabase read-only backup 7–30 days |

## DNS and traffic

- [ ] Point `dair.gg` (or target domain) to kubi client CDN / origin
- [ ] API subdomain → kubi API load balancer
- [ ] Update OAuth redirect URLs (Discord, Google consoles)
- [ ] `ALLOWED_ORIGINS`, `DEFAULT_CLIENT_URL` production values

## Post-cutover data strategy

- **Historical player/ranked data:** workers repopulate over 24–48h; optional one-time import (phase 3) speeds up “history” features
- **Aliases/bookmarks/users:** must come from migrator — not recreated by crawlers

## Rollback

- Keep corehalla stack deployable for 48h
- DNS revert procedure documented
- Supabase still readable until backup retention ends

## Ongoing ops

| Job | Interval | Owner |
|-----|----------|-------|
| Leaderboard crawler | 10 min | workers |
| Rankings / player crawl | 6 h | workers |
| DB backups | daily | infra |
| Redis persistence | per policy | infra |
| Dependency updates | weekly | dev — watch Effect smol |

## Documentation updates at cutover

- [ ] README production section (replace any Supabase dev instructions)
- [ ] Remove `scripts/migration/` references entirely
- [ ] AGENTS.md — mark migration phases complete
- [ ] Archive `.plans/0*.md` or move to `docs/migration/` when done

## Out of scope

- Discord bot migration ([corehalla worker appa-bot](../.repos/corehalla/worker/src/appa-bot/)) — separate decision
