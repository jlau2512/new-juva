import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';
import { locales } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/work', '/services', '/contact'];
  const out: MetadataRoute.Sitemap = [];
  for (const l of locales) {
    for (const p of paths) {
      out.push({
        url: `${SITE.url}/${l}${p}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: p === '' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(locales.map((x) => [x, `${SITE.url}/${x}${p}`])),
        },
      });
    }
  }
  return out;
}
