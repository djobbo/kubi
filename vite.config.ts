import { defineConfig } from "vite-plus"

/**
 * Root Vite+ config for the monorepo (`vp run`, `vp check`, `vp staged`, `vp config`).
 * App-level Vite (TanStack Start) lives in apps/client/vite.config.ts.
 */
export default defineConfig({
  fmt: {
    semi: false,
    singleQuote: false,
    tabWidth: 2,
    useTabs: false,
    trailingComma: "all",
    printWidth: 80,
    arrowParens: "always",
    jsxSingleQuote: false,
    bracketSameLine: false,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    cache: true,
    tasks: {
      "compose:up": {
        command: "vp exec tsx scripts/compose.ts up --wait",
        cache: false,
      },
      build: {
        command: "vp run -r build",
        output: ["dist/**", "build/**"],
      },
      test: {
        command: "vp run -r test",
        dependsOn: ["build"],
        output: ["coverage/**"],
      },
      "check:types": {
        command: "vp run -r check:types",
        dependsOn: ["build"],
      },
      dev: {
        command: "vp run -r --parallel dev studio",
        cache: false,
        dependsOn: ["compose:up"],
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
})
