import type { Metadata } from 'next';
import { SITE } from './config';
import { locales, type Locale } from './i18n';

// Builds canonical + hreflang alternates for a page.
// `path` is the locale-relative path, e.g. '' for home or '/work'.
export function alternates(path: string, locale: Locale): Metadata['alternates'] {
  return {
    canonical: `${SITE.url}/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `${SITE.url}/${l}${path}`])),
      'x-default': `${SITE.url}/en${path}`,
    },
  };
}
