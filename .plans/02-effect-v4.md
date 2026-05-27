# Phase 2: Effect v3 → v4 migration

**Goal:** One Effect version across the monorepo, aligned with vendored [effect-smol](https://github.com/Effect-TS/effect-smol) (`.repos/effect`).

**Today:** `effect@^3.19.15` everywhere ([package.json](../package.json), apps, packages). [scripts/setup/](../scripts/setup/) already imports v4 modules (`effect/Data`, `effect/unstable/process`, …).

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

- [ ] `rg 'from "effect' --glob '*.ts'` — list import sites per workspace.
- [ ] List `@effect/*` versions in all `package.json` files; use `syncpack` to align.
- [ ] Note v3-only patterns in repo:
  - `Effect.Service` with `Effect.fn` (may remain but verify API)
  - `Context.Tag` services (e.g. [bookmarks](../apps/api/src/services/bookmarks/index.ts))
  - `Schema.TaggedError` / `HttpApiSchema` in api-contract
  - `@effect/platform-node` vs `@effect/platform-bun`

### Step 2.2 Bump dependencies (single PR or stacked)

- [ ] Root `effect` + all `@effect/platform*`, `@effect/sql*`, `@effect/cli`, `@effect/experimental`, `@effect/opentelemetry`, `@effect-atom/atom-react`.
- [ ] Remove packages that merged into core `effect` per smol docs.
- [ ] Run `bun install` and fix peer dependency warnings.

### Step 2.3 Codemods / manual fixes (typical breaks)

Work workspace order: `packages/common` → `schema` → `db` → `api-contract` → `brawlhalla-*` → `apps/api` → `apps/workers` → `apps/client` → `scripts/setup`.

| Area | v3 pattern | v4 action |
|------|------------|-----------|
| Errors | `Data.TaggedError` | Often `Schema.TaggedError` only; verify imports |
| Services | `Effect.Service` | Match smol `Effect.Service` docs in `.repos/effect` |
| Layers | `Layer.provide` chains | Unchanged conceptually; fix breaking renames |
| Platform | `HttpApi`, `HttpClient` | Update to smol platform package paths |
| SQL | `@effect/sql-pg` + Drizzle | Check dialect layer API |
| Config | `Config.redacted` | Confirm still available |
| Process | N/A in apps | Setup already uses `ChildProcessSpawner` |

- [ ] Replace deprecated imports (`effect/Effect` vs `effect` barrel — follow smol convention).
- [ ] Fix `@dair/services/*` tags if language service rules change.
- [ ] Update [.cursor/rules/effect-patterns.mdc](../.cursor/rules/effect-patterns.mdc) from `effect-solutions show` output for v4.

### Step 2.4 Tooling

- [ ] `effect-language-service patch` / `prepare` scripts still run.
- [ ] `bun check:types` green for all workspaces.
- [ ] `bun test` — fix stream/channel test breaks if any.

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

## Files (high churn)

- All `package.json` under `apps/*`, `packages/*`, root
- `apps/api/src/**/*.ts`, `apps/workers/src/**/*.ts`
- `packages/api-contract/src/**/*.ts`
- `scripts/setup/**/*.mts`
