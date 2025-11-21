import type { KnipConfig } from "knip"

export default {
  workspaces: {
    ".": {
      entry: ["scripts/migration/migrate.ts"],
    },
  },
} satisfies KnipConfig
