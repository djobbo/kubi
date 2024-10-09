import type { LinguiConfig } from "@lingui/conf"

const config: LinguiConfig = {
  locales: ["en", "fr", "pseudo"],
  sourceLocale: "en",
  pseudoLocale: "pseudo",
  fallbackLocales: {
    default: "en",
  },
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}/messages",
      include: ["app"],
    },
  ],
  format: "po",
  compileNamespace: "ts",
}

export default config
