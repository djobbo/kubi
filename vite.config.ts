import { defineConfig } from "vite-plus"

/**
 * Root Vite+ config for the monorepo (`vp run`, `vp check`, `vp staged`, `vp config`).
 * App-level Vite (TanStack Start) lives in apps/client/vite.config.ts.
 */
export default defineConfig({
  run: {
    cache: true,
  },
  staged: {
    "*": "vp check --fix --fix-suggestions",
  },
})
