import { type Locale, getDict } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import Work from '@/components/sections/Work';
import CTA from '@/components/sections/CTA';
import Reveal from '@/components/Reveal';
import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const isFr = params.locale === 'fr';
  return {
    title: isFr ? 'Projets — études de cas' : 'Work — case studies',
    description: isFr
      ? 'Une sélection de sites et d’apps livrés récemment.'
      : 'A selection of websites and apps we shipped recently.',
    alternates: { canonical: `${SITE.url}/${params.locale}/work` },
  };
}

export default function WorkPage({ params }: { params: { locale: Locale } }) {
  const dict = getDict(params.locale);
  return (
    <div className="pt-32 md:pt-40">
      <div className="container-x">
        <Reveal>
          <span className="pill">{dict.work.label}</span>
          <h1 className="mt-5 max-w-3xl h-display text-5xl md:text-7xl">
            {dict.work.title} <span className="text-accent">{dict.work.titleStrong}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-ink-muted">{dict.work.sub}</p>
        </Reveal>
      </div>
      <Work locale={params.locale} dict={dict} />
      <CTA locale={params.locale} dict={dict} />
    </div>
  );
}
