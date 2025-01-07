import { i18n } from "@lingui/core"

import { messages as enMessages } from "@/locales/en/messages"
import { messages as frMessages } from "@/locales/fr/messages"

export const loadLocales = async () => {
  i18n.load({
    en: enMessages,
    fr: frMessages,
  })
}

export const activateLocale = async (locale: string) => {
  i18n.activate(locale)
}
