import { i18n } from '@lingui/core'
import linguiConfig from '~/lingui.config'
import config, { type Locale } from '~/lingui.config'

const validateLocale = (locale: string): locale is Locale => {
  return config.locales.includes(locale as Locale)
}

export const activateLocale = async (
  locale: string = linguiConfig.sourceLocale,
) => {
  if (!validateLocale(locale)) return

  const { messages } = await import(`./${locale}/messages.ts`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}
