import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"

export function getContext() {
	return {
		i18n,
	}
}

export type Context = ReturnType<typeof getContext>

export function Provider({ children }: { children: React.ReactNode }) {
	return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
