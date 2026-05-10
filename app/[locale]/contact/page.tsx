import { type Locale, getDict } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import QuoteWizard from '@/components/QuoteWizard';
import Reveal from '@/components/Reveal';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const isFr = params.locale === 'fr';
  return {
    title: isFr ? 'Contact — devis gratuit' : 'Contact — get a free quote',
    description: isFr
      ? "Parlons de votre projet. Un devis fixe en 48h."
      : "Let's talk about your project. A fixed quote within 48 hours.",
    alternates: { canonical: `${SITE.url}/${params.locale}/contact` },
  };
}

export default function Contact({ params }: { params: { locale: Locale } }) {
  const dict = getDict(params.locale);
  return (
    <section className="container-x relative pt-32 pb-24 md:pt-44">
      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <span className="pill">{dict.quote.open}</span>
          <h1 className="mt-5 h-display text-4xl md:text-6xl">{dict.quote.title}</h1>
          <p className="mt-4 max-w-md text-ink-muted">{dict.quote.sub}</p>

          <div className="mt-12 space-y-5">
            <Item icon={<Mail size={18} className="text-accent" />} label={SITE.email} href={`mailto:${SITE.email}`} />
            <Item icon={<Phone size={18} className="text-accent" />} label={SITE.phone} href={`tel:${SITE.phone.replace(/\s/g, '')}`} />
            <Item icon={<MapPin size={18} className="text-accent" />} label={`${SITE.city}, ${SITE.country}`} />
            <Item
              icon={<Clock size={18} className="text-accent" />}
              label={params.locale === 'fr' ? 'Lun–Ven, 9h–18h (GMT+4)' : 'Mon–Fri, 9am–6pm (GMT+4)'}
            />
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={0.15}>
          <QuoteWizard dict={dict} locale={params.locale} />
        </Reveal>
      </div>
    </section>
  );
}

function Item({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const content = (
    <span className="flex items-center gap-3 text-sm text-ink-muted transition-colors hover:text-ink">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-bg-card">
        {icon}
      </span>
      {label}
    </span>
  );
  return href ? <a href={href}>{content}</a> : <div>{content}</div>;
}
