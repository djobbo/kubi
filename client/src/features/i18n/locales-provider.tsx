import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import type { ReactNode } from "react"

type LocalesProviderProps = {
  children: ReactNode
}

export function LocalesProvider({ children }: LocalesProviderProps) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
