import type { KnipConfig } from "knip"

export default {
  entry: [
    // tanstack/start entrypoints
    "app.config.ts",
    "eslint.config.mjs",
    "app/client.tsx",
    "app/router.ts",
    "app/ssr.tsx",
    "app/routes/**/*.tsx",
    "app/routes/api/**/*.ts",
    "app/api.ts",
    // scripts
    "scripts/**/*.ts",
    // migration script
    "app/db/migrate.ts",
    // pwa assets
    "pwa-assets.config.ts",
    // lingui
    "lingui.config.ts",
  ],
  ignore: [
    // tanstack/start ignore generated route file
    "app/routeTree.gen.ts",
  ],
  ignoreDependencies: [
    // tansctack/start ignore dependency (used by vinxi)
    "@vitejs/plugin-react",
  ],
  // TOREMOVE: when github actions plugin works
  "github-actions": { config: [".github/workflows/*.{yml}"] },
} satisfies KnipConfig
