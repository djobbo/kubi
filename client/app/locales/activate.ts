import { i18n } from '@lingui/core';

import { messages as enMessages } from '@/locales/en/messages';
import { messages as frMessages } from '@/locales/fr/messages';
import linguiConfig from '~/lingui.config';

export const activateLocale = async (lang?: string) => {
  i18n.load({
    en: enMessages,
    fr: frMessages,
  });
  i18n.activate(lang ?? linguiConfig.sourceLocale);
};
