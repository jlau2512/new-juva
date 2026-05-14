import { type Locale, getDict } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import CTA from '@/components/sections/CTA';
import Reveal from '@/components/Reveal';
import CoreServices from '@/components/services/CoreServices';
import Addons from '@/components/services/Addons';
import WhyJuva from '@/components/services/WhyJuva';
import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const isFr = params.locale === 'fr';
  return {
    title: isFr
      ? 'Services — sites, apps, identité & options'
      : 'Services — websites, apps, identity & add-ons',
    description: isFr
      ? 'Sites web qui convertissent, applications sur mesure et identité de marque — plus des options SEO, performance et maintenance. Devis à prix fixe sous 48h.'
      : 'Websites that convert, custom applications and brand identity — plus SEO, performance and care-plan add-ons. Fixed-fee quote within 48 hours.',
    alternates: { canonical: `${SITE.url}/${params.locale}/services` },
  };
}

export default function ServicesPage({ params }: { params: { locale: Locale } }) {
  const dict = getDict(params.locale);
  const s = dict.services;

  return (
    <div>
      {/* 1. Page hero */}
      <section className="pt-32 md:pt-40">
        <div className="container-x">
          <Reveal>
            <span className="section-label">{s.label}</span>
            <h1 className="mt-5 max-w-4xl font-display font-medium text-[clamp(38px,6.2vw,76px)] leading-[1.03] tracking-[-0.03em] text-ink">
              {s.title} <span className="italic text-accent">{s.titleStrong}</span>
            </h1>
            <p className="mt-7 max-w-[46rem] text-[17px] leading-relaxed text-ink-muted">{s.lead}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. The 3 core services */}
      <CoreServices
        items={s.items}
        labels={{
          deliverablesLabel: s.deliverablesLabel,
          idealForLabel: s.idealForLabel,
          timelineLabel: s.timelineLabel,
        }}
      />

      {/* 3. Add-ons */}
      <Addons label={s.addonsLabel} title={s.addonsTitle} items={s.addons} />

      {/* 4. Why JUVA */}
      <WhyJuva label={s.whyLabel} title={s.whyTitle} items={s.why} />

      {/* 5. CTA */}
      <CTA locale={params.locale} dict={dict} />
    </div>
  );
}
