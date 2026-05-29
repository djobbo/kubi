import type { LinguiConfig } from "@lingui/conf"

/**
 * Lingui config at the monorepo root so Vite+ can resolve the client app config
 * when loading apps/client/vite.config.ts from the repository root.
 */
const config = {
  locales: ["en", "fr", "pseudo"],
  sourceLocale: "en",
  pseudoLocale: "pseudo",
  fallbackLocales: {
    default: "en",
  },
  catalogs: [
    {
      path: "<rootDir>/apps/client/src/features/i18n/locales/{locale}/messages",
      include: ["apps/client/src"],
    },
  ],
  format: "po",
  compileNamespace: "ts",
} as const satisfies LinguiConfig

export default config
