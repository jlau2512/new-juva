import { type Locale, getDict } from '@/lib/i18n';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/sections/Marquee';
import Services from '@/components/sections/Services';
import Process from '@/components/sections/Process';
import Work from '@/components/sections/Work';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import FallingLeaves from '@/components/FallingLeaves';
import type { Metadata } from 'next';
import { SITE } from '@/lib/config';
import { alternates } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const isFr = params.locale === 'fr';
  const title = isFr
    ? `${SITE.name} — Studio digital premium à Maurice`
    : `${SITE.name} — Premium Digital Studio in Mauritius`;
  const desc = isFr
    ? 'Création de sites web à Maurice, apps sur mesure et identité de marque pour des équipes ambitieuses.'
    : 'Web design in Mauritius: websites, custom apps, and brand identity for ambitious teams.';
  return {
    title,
    description: desc,
    alternates: alternates('', params.locale),
    openGraph: { title, description: desc, locale: params.locale === 'fr' ? 'fr_FR' : 'en_US' },
  };
}

export default function Home({ params }: { params: { locale: Locale } }) {
  const dict = getDict(params.locale);
  return (
    <>
      <FallingLeaves />
      <Hero locale={params.locale} dict={dict} />
      <Marquee dict={dict} />
      <Services dict={dict} />
      <Process dict={dict} />
      <Work locale={params.locale} dict={dict} />
      <Testimonials dict={dict} />
      <FAQ dict={dict} />
      <CTA locale={params.locale} dict={dict} />
    </>
  );
}
