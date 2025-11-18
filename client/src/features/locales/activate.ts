import { i18n } from '@lingui/core'
import linguiConfig from '~/lingui.config'
import config, { type Locale } from '~/lingui.config'

export const activateLocale = async (
  locale: Locale = linguiConfig.sourceLocale,
) => {
  if (!config.locales.includes(locale)) return

  const { messages } = await import(`./${locale}/messages.ts`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}
