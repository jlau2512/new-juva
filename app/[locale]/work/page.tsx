import { type Locale, getDict } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import WorkIntro from '@/components/work/Intro';
import Work from '@/components/sections/Work';
import CTA from '@/components/sections/CTA';
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
    <div>
      <WorkIntro copy={dict.work.intro} />
      <Work locale={params.locale} dict={dict} />
      <CTA locale={params.locale} dict={dict} />
    </div>
  );
}
