import { i18n } from "@lingui/core"
import config, { type Locale } from "#/lingui.config"

const validateLocale = (locale?: string): locale is Locale => {
  if (!locale) return false
  return config.locales.includes(locale as Locale)
}

export const activateLocale = async (locale?: string) => {
  if (!validateLocale(locale)) {
    console.error(`Locale ${locale} not found`)
    return
  }

  const locales = import.meta.glob("./locales/*/messages.po")
  const localeLoader = locales[`./locales/${locale}/messages.po`]

  if (!localeLoader) {
    console.error(`Locale ${locale} not found`)
    return
  }

  const { messages } = (await localeLoader()) as {
    messages: Record<string, string>
  }
  i18n.load(locale, messages)
  i18n.activate(locale)
}
