# Phase 2: Effect v3 → v4 migration

**Goal:** One Effect version across the monorepo, aligned with vendored [effect-smol](https://github.com/Effect-TS/effect-smol) (`.repos/effect`).

**Today:** Catalog targets **`effect@4.0.0-beta.71`**; `@dair/api-contract` typechecks on v4 HttpApi. **`apps/api` still ~400 errors** — tracked in [02-effect-v4-remaining.md](./02-effect-v4-remaining.md). [scripts/setup/](../scripts/setup/) runs on Effect v4 (`effect/unstable/process`, `NodeServices`).

## Why migrate

- Setup and future platform code follow smol APIs.
- `@effect/platform` / `@effect/sql-*` releases track v4.
- Cursor rules and `bunx effect-solutions` should match the runtime actually installed.

## Reference material

1. Vendored tree: `.repos/effect` after `bun run setup` → `syncVendoredRepos`.
2. Upstream migration notes inside effect-smol (search `MIGRATION`, `CHANGELOG`, package READMEs).
3. `bunx effect-solutions list` / `show` — re-run after bumping effect-solutions for v4 topics.

## Parallel work

- **Phase 3 (data migration)** can proceed on Effect v3 if `apps/migrator` stays imperative Bun scripts.
- **Phase 1 (setup)** needs either an isolated v4 `scripts/setup` package or a v3 rewrite until this phase lands.

Recommended: **isolate setup on v4** early, migrate apps bottom-up.

## Migration strategy

### Step 2.1 Inventory

- [x] `rg 'from "effect' --glob '*.ts'` — list import sites per workspace.
- [x] List `@effect/*` versions in [pnpm-workspace.yaml](../pnpm-workspace.yaml) catalog; `vp install`.
- [x] Note v3-only patterns — see [02-effect-v4-remaining.md](./02-effect-v4-remaining.md):
  - `Effect.Service` → `Context.Service` (9 services in `apps/api`)
  - `Context.Tag` → `Context.Service` (6 config/bookmark tags)
  - `Schema.TaggedError` → `TaggedErrorClass`; HttpApi template → `HttpApiEndpoint.get(name, path, opts)`
  - `@effect/platform` → `effect/unstable/http` + `effect/unstable/httpapi`

### Step 2.2 Bump dependencies (single PR or stacked)

- [x] Root `effect@4.0.0-beta.71` + `@effect/platform-node`, `@effect/sql-pg`, `@effect/opentelemetry`, `@effect/atom-react`.
- [x] Removed merged packages from catalog (`@effect/platform`, `@effect/sql`, `@effect/experimental`, `@effect/cli` as separate deps where inlined).
- [x] `vp install`; Drizzle `1.0.0-rc.1` + `drizzle-orm/effect-postgres` in [apps/api/src/services/db/index.ts](../apps/api/src/services/db/index.ts).
- [ ] Resolve remaining peer warnings (oxlint, vite beta, etc.) if they block CI.

### Step 2.3 Codemods / manual fixes (typical breaks)

**Detailed checklist:** [02-effect-v4-remaining.md](./02-effect-v4-remaining.md)

Work workspace order: `packages/common` → `db` → `api-contract` → `brawlhalla-*` → `apps/api` → `apps/workers` → `apps/client` → `scripts/setup` → deprecate `schema`.

| Area | v3 pattern | v4 action | Status |
|------|------------|-----------|--------|
| Errors | `Schema.TaggedError` | `Schema.TaggedErrorClass` | API errors done |
| Services | `Effect.Service` | `Context.Service` + `Layer.effect` | **TODO** — 2b.1 |
| Platform | `HttpApi` template tags | `HttpApiEndpoint.get(name, path, opts)` | api-contract done |
| Platform imports | `@effect/platform` | `effect/unstable/http(api)` | Done |
| Schema | `optionalWith`, `Literal(...)` | See schema.md | api-contract done; **API TODO** 2b.2 |
| Atom | `@effect-atom/atom-react` barrel | `effect/unstable/reactivity` + `@effect/atom-react` hooks | Client done |
| Zod | `zod/v4` in brawlhalla-api | Types or Effect Schema | **TODO** — 2b.3 |
| SQL | Drizzle + `@effect/sql-pg` | `drizzle-orm/effect-postgres` | DB service done |
| Relations | `relations()` | `defineRelations` (shim: `_relations`) | **TODO** — 2b.5 |

- [x] Replace `@effect/platform` imports in apps and setup.
- [ ] Complete [02-effect-v4-remaining.md](./02-effect-v4-remaining.md) § 2b.1–2b.5.
- [ ] Update [.cursor/rules/effect-patterns.mdc](../.cursor/rules/effect-patterns.mdc) for `Context.Service` (still documents `Effect.Service`).

### Step 2.4 Tooling

- [x] `effect-language-service` on catalog `0.85.1`; `prepare` in `@dair/api`.
- [ ] `vp run check:types` green for all workspaces (blocked on 2b.1–2b.2).
- [ ] `vp run test` — fix stream/channel test breaks if any.

### Step 2.5 Workers & client

- [ ] `apps/workers` — Effect fibers, schedulers ([workers/shared/scheduler](../apps/api/src/workers/shared/) patterns).
- [ ] `apps/client` — `@effect-atom/atom-react`, `@effect/platform` client usage.

### Step 2.6 Verify runtime

- [ ] API: health, one Brawlhalla endpoint, auth callback smoke test.
- [ ] Workers: crawl one region page without rate-limit storm.
- [ ] `bun run setup` with unified effect version.

## Rollback plan

Keep a git branch `effect-v3` until staging passes. Pin versions in root `package.json` overrides if a single package blocks the bump.

## Definition of done

- No `effect@3` in lockfile.
- `scripts/setup` and `apps/api` share the same `effect` major.
- AGENTS.md “Effect v4” row matches installed packages.
- All items in [02-effect-v4-remaining.md](./02-effect-v4-remaining.md) checked off.

## Sub-plans

| Doc | Scope |
|-----|--------|
| [02-effect-v4-remaining.md](./02-effect-v4-remaining.md) | API typecheck blockers: Context.Service, Schema, Zod, schema package, Drizzle relations, phase 4–6 gates |

## Files (high churn)

- All `package.json` under `apps/*`, `packages/*`, root
- `apps/api/src/**/*.ts`, `apps/workers/src/**/*.ts`
- `packages/api-contract/src/**/*.ts`
- `scripts/setup/**/*.mts`
