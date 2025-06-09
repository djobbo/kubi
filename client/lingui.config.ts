import type { LinguiConfig } from '@lingui/conf';

enum Locales {
  EN = 'en',
  FR = 'fr',
  Pseudo = 'pseudo',
}

const config = {
  locales: [Locales.EN, Locales.FR, Locales.Pseudo],
  sourceLocale: Locales.EN,
  pseudoLocale: Locales.Pseudo,
  fallbackLocales: {
    default: Locales.EN,
  },
  catalogs: [
    {
      path: '<rootDir>/app/locales/{locale}/messages',
      include: ['app'],
    },
  ],
  format: 'po',
  compileNamespace: 'ts',
} as const satisfies LinguiConfig;

export default config;
