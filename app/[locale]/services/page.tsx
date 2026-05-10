import { type Locale, getDict } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import Services from '@/components/sections/Services';
import Process from '@/components/sections/Process';
import CTA from '@/components/sections/CTA';
import Reveal from '@/components/Reveal';
import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const isFr = params.locale === 'fr';
  return {
    title: isFr ? 'Services — sites, apps, identité' : 'Services — websites, apps, identity',
    description: isFr
      ? 'Trois domaines : sites web qui convertissent, apps sur mesure, identité de marque.'
      : 'Three lanes: websites that convert, custom apps, brand & identity.',
    alternates: { canonical: `${SITE.url}/${params.locale}/services` },
  };
}

export default function ServicesPage({ params }: { params: { locale: Locale } }) {
  const dict = getDict(params.locale);
  return (
    <div className="pt-32 md:pt-40">
      <div className="container-x">
        <Reveal>
          <span className="pill">{dict.services.label}</span>
          <h1 className="mt-5 max-w-3xl h-display text-5xl md:text-7xl">
            {dict.services.title} <span className="text-accent">{dict.services.titleStrong}</span>
          </h1>
        </Reveal>
      </div>
      <Services dict={dict} />
      <Process dict={dict} />
      <CTA locale={params.locale} dict={dict} />
    </div>
  );
}
