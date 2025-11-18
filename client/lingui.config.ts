import type { LinguiConfig } from "@lingui/conf"

const Locales  = {
	EN: "en",
	FR: "fr",
	Pseudo: "pseudo",
} as const

export type Locale = (typeof Locales)[keyof typeof Locales]

const config = {
	locales: [Locales.EN, Locales.FR, Locales.Pseudo],
	sourceLocale: Locales.EN,
	pseudoLocale: Locales.Pseudo,
	fallbackLocales: {
		default: Locales.EN,
	},
	catalogs: [
		{
			path: "<rootDir>/src/features/locales/{locale}/messages",
			include: ["src"],
		},
	],
	format: "po",
	compileNamespace: "ts",
} as const satisfies LinguiConfig

export default config
