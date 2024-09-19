import {type KnipConfig} from "knip"

export default {
  entry: [
    "app.config.ts",
    "eslint.config.mjs",
    "app/client.tsx",
    "app/router.ts",
    "app/ssr.tsx",
    "app/routes/**/*.tsx",
  ],
  ignore: ["app/routeTree.gen.ts"],
  // TOREMOVE: when github actions plugin works
  "github-actions": {
    "config": [".github/workflows/*.{yml}"],
  },
} satisfies KnipConfig
