# Phase 1: Dev setup (`scripts/setup`)

**Problem:** [scripts/setup/setup.mts](../scripts/setup/setup.mts) is a port of corehalla’s bootstrap but kubi’s stack and tooling have diverged. Setup must run under **Vite+** (`vp`) with **pnpm** pinned to the vendored [.repos/vite-plus](../.repos/vite-plus) monorepo — see [07-vite-plus-toolchain.md](./07-vite-plus-toolchain.md).

## Symptoms (why it fails today)

1. **No wired `setup` script** — was missing from root `package.json` (now `"setup": "vp exec tsx scripts/setup/setup.mts"`).
2. **Supabase-centric flow** — setup starts `supabase` via Docker and syncs `DATABASE_URL` from `supabase status`. Kubi dev DB is **Postgres in [compose.dev.yml](../compose.dev.yml)** (`vp run compose:up`), not local Supabase.
3. **Wrong migrate command** — should be `vp run -F @dair/api db:migrate` (or turbo filter), not a nonexistent root `db:migrate`.
4. **Missing root `.env.example`** — `ensureEnvFile()` copies `.env.example` → `.env`; root example file is absent.
5. **Effect version mismatch** — setup uses **v4** APIs (`effect/Data`, `effect/FileSystem`, `effect/unstable/process`). Workspace pins **effect@^3.19.15**.
6. **Stale branding** — logs `Corehalla ${version}`; should be `dair` / kubi.
7. **README drift** — [README.md](../README.md) still lists `scripts/migration/`; migrator is `apps/migrator/`.
8. **Lockfile** — need `vp install` to generate `pnpm-lock.yaml` after switching from Bun workspaces.

## Target behavior

After **`vp run setup`** from repo root:

1. Ensure `.env` (from `.env.example`) with sane defaults for **compose Postgres + Redis**.
2. `vp run compose:up` (Docker Postgres + Redis healthy).
3. `vp install` (pnpm version from `packageManager`, matches `.repos/vite-plus`).
4. `syncVendoredRepos({})` (includes `vite-plus` clone).
5. Apply Drizzle migrations: `vp run -F @dair/api db:migrate`.
6. Print: API URL, client URL, Drizzle Studio, Grafana (if instrumentation compose is up).

**Supabase:** not started in default dev setup. Optional `--with-supabase` for [phase 3](./03-supabase-to-pg.md) migrator credentials only.

## Prerequisites

- **Node.js** `>=22.12.0` (see root `engines`; vite-plus monorepo recommends `>=22.18.0`).
- **Docker** for compose services.
- **vp** available after first `vp install` (or `pnpm dlx vite-plus install` bootstrap).

```bash
# Fresh clone (after .env.example exists)
vp install
vp run setup
vp run dev
```

## Tasks

### 1.1 Toolchain (see phase 07)

- [x] Root [vite.config.ts](../vite.config.ts), [pnpm-workspace.yaml](../pnpm-workspace.yaml), `packageManager: pnpm@10.33.2`
- [x] `"setup"` script via `vp exec tsx`
- [x] Commit `pnpm-lock.yaml` after successful `vp install`
- [x] Align [scripts/setup/setup.mts](../scripts/setup/setup.mts) with compose + `vp install` + drizzle migrate

### 1.2 Root environment template

- [x] Add [`.env.example`](../.env.example) at repo root.
- [ ] Minimum keys:

```bash
DATABASE_URL=postgresql://dair:dair@localhost:5432/dair
REDIS_URL=redis://localhost:6379
API_PORT=3000
APP_PORT=3001
API_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
DEFAULT_CLIENT_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001
BRAWLHALLA_API_KEY=
OAUTH_SECRET=
# Phase 3 only:
# MIGRATION_SUPABASE_URL=
# MIGRATION_SUPABASE_SERVICE_KEY=
```

- [x] Remove default Supabase key sync from setup; gate behind `--with-supabase`.

### 1.3 Replace Supabase bootstrap with compose

- [x] Compose via `vp exec tsx scripts/compose.ts up --wait` (avoids turbo graph during bootstrap).
- [x] Drop `dotenv` CLI — use `dotenv/config` in entrypoints and `vp exec tsx`.

### 1.4 Fix migration step

- [x] `vp exec drizzle-kit migrate` in `apps/api` with retries.

### 1.5 Effect compatibility (short-term)

**Option A:** `scripts/setup/package.json` on Effect v4 only.  
**Option B:** Rewrite setup without v4-only APIs until [02-effect-v4.md](./02-effect-v4.md).

### 1.6 Docs and DX

- [ ] README: `vp install` → `vp run setup` → `vp run dev`.
- [ ] [AGENTS.md](../AGENTS.md), [vendored-repos.md](./vendored-repos.md) — `vp` commands, correct paths to [scripts/setup/sync-vendored-repos.mts](../scripts/setup/sync-vendored-repos.mts).

## Verification

```bash
vp install
vp run setup
vp run compose:up   # or docker compose -f compose.dev.yml ps
vp run check:types
vp run -F @dair/api dev
vp run -F @dair/client dev
```

## Files to touch

| File | Change |
|------|--------|
| [package.json](../package.json) | `setup`, `packageManager`, vite-plus |
| [vite.config.ts](../vite.config.ts) | staged / run |
| [scripts/setup/setup.mts](../scripts/setup/setup.mts) | compose + vp + branding |
| `.env.example` | new |
| [AGENTS.md](../AGENTS.md), [README.md](../README.md) | vp + pnpm |

## Depends on

- [07-vite-plus-toolchain.md](./07-vite-plus-toolchain.md)
- [02-effect-v4.md](./02-effect-v4.md) for unified Effect in setup scripts
