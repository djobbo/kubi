import { i18n } from "@lingui/core"

import { messages as enMessages } from "@/locales/en/messages"
import { messages as frMessages } from "@/locales/fr/messages"

export const activate = async (locale: string) => {
  i18n.load({
    en: enMessages,
    fr: frMessages,
  })
  i18n.activate(locale)
}
