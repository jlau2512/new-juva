import { type Locale, getDict } from '@/lib/i18n';
import { SITE } from '@/lib/config';
import CTA from '@/components/sections/CTA';
import Reveal from '@/components/Reveal';
import Timeline from '@/components/process/Timeline';
import Principles from '@/components/process/Principles';
import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const isFr = params.locale === 'fr';
  return {
    title: isFr
      ? 'Méthode — quatre phases, zéro surprise'
      : 'Process — four phases, zero surprises',
    description: isFr
      ? 'Notre méthode en quatre phases : découverte, design, développement et lancement. Périmètre fixe, prix fixe, transparence totale et 30 jours de support après la mise en ligne.'
      : 'Our four-phase process: discover, design, build and launch. Fixed scope, fixed fee, full transparency and 30 days of support after you go live.',
    alternates: { canonical: `${SITE.url}/${params.locale}/process` },
  };
}

export default function ProcessPage({ params }: { params: { locale: Locale } }) {
  const dict = getDict(params.locale);
  const p = dict.process;

  return (
    <div>
      {/* 1. Page hero */}
      <section className="pt-32 md:pt-40">
        <div className="container-x">
          <Reveal>
            <span className="section-label">{p.label}</span>
            <h1 className="mt-5 max-w-4xl font-display font-medium text-[clamp(38px,6.2vw,76px)] leading-[1.03] tracking-[-0.03em] text-ink">
              {p.title} <span className="italic text-accent">{p.titleStrong}</span>
            </h1>
            <p className="mt-7 max-w-[46rem] text-[17px] leading-relaxed text-ink-muted">{p.lead}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. The 4 phases */}
      <Timeline
        steps={p.steps}
        labels={{ deliverableLabel: p.deliverableLabel, durationLabel: p.durationLabel }}
      />

      {/* 3. Principles */}
      <Principles label={p.principlesLabel} title={p.principlesTitle} items={p.principles} />

      {/* 4. Closing reassurance */}
      <section className="relative py-24 md:py-32">
        <div className="container-x relative">
          <Reveal className="mx-auto max-w-[44rem] text-center">
            <h2 className="font-display text-[clamp(30px,4.5vw,52px)] leading-[1.1] tracking-[-0.02em] text-ink">
              {p.closingTitle}
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-ink-muted">{p.closingBody}</p>
          </Reveal>
        </div>
      </section>

      {/* 5. CTA */}
      <CTA locale={params.locale} dict={dict} />
    </div>
  );
}
