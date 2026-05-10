export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

import en from './dictionaries/en';
import fr from './dictionaries/fr';

export const dictionaries = { en, fr } as const;
export type Dict = typeof en;

export function getDict(locale: Locale): Dict {
  return (dictionaries[locale] ?? dictionaries[defaultLocale]) as Dict;
}

export function alt(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}
