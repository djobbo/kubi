import type { Messages } from "@lingui/core"
import { i18n } from "@lingui/core"

export const activate = async (locale: string) => {
  const { messages } = (await import(`./locales/${locale}/messages.po`)) as {
    messages: Messages
  }

  i18n.load(locale, messages)
  i18n.activate(locale)
}
