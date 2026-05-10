'use client';
import { useEffect, useRef } from 'react';
import MagneticButton from '@/components/MagneticButton';
import { ArrowRight } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

export default function CTA({ locale, dict }: { locale: string; dict: Dict }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ctx: any; let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo('.js-cta-content',
          { scale: 0.92, opacity: 0 },
          {
            scale: 1, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 35%', scrub: 0.6 },
          });
      }, el);
    })();
    return () => { cancelled = true; try { ctx?.revert(); } catch {} };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-40 bg-bg-surface">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="w-[600px] h-[300px] rounded-full bg-accent/[0.04] blur-[80px]" />
      </div>
      <div className="js-cta-content container-x relative text-center">
        <h2 className="font-display text-[clamp(48px,8.5vw,110px)] leading-[0.92] tracking-[-0.02em] text-ink">
          {dict.cta.titleA}<br />
          <em className="not-italic italic text-accent">{dict.cta.titleB}</em>
        </h2>
        <p className="mt-8 mx-auto max-w-md text-[16px] text-ink-muted">{dict.cta.sub}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <MagneticButton href={`/${locale}/contact`} className="btn-primary text-base !px-8 !py-5">
            {dict.cta.primary} <ArrowRight size={17} />
          </MagneticButton>
          <a href={`mailto:hello@juva.mu`} className="btn-ghost text-base !px-8 !py-5">{dict.cta.secondary}</a>
        </div>
      </div>
    </section>
  );
}
