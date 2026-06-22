import { notFound } from 'next/navigation';
import { locales, getDict, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import ScrollProgress from '@/components/ScrollProgress';
import WhatsAppButton from '@/components/WhatsAppButton';
import ExitIntent from '@/components/ExitIntent';
import Noise from '@/components/Noise';
import Butterfly from '@/components/Butterfly';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  const dict = getDict(locale as Locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'JUVA Digital Studio',
    description:
      'Premium web design and custom application development for ambitious teams in Mauritius and beyond.',
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressCountry: SITE.country,
    },
    areaServed: { '@type': 'Place', name: 'Mauritius' },
    serviceType: ['Web Design', 'Custom Application Development', 'Brand Identity'],
    foundingDate: SITE.founded,
    priceRange: '$$$',
    inLanguage: ['en', 'fr'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Noise />
      <SmoothScroll />
      <ScrollProgress />
      <Header locale={locale as Locale} dict={dict} />
      <main className="relative z-10">{children}</main>
      <Footer locale={locale as Locale} dict={dict} />
      <WhatsAppButton dict={dict} />
      <ExitIntent dict={dict} />
      <Butterfly />
    </>
  );
}
