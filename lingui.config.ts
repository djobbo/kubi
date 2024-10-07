import type { LinguiConfig } from "@lingui/conf"

const config: LinguiConfig = {
  locales: ["en", "fr"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}/messages",
      include: ["app"],
    },
  ],
  compileNamespace: "ts",
}

export default config
