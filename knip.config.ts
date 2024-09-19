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
} satisfies KnipConfig
