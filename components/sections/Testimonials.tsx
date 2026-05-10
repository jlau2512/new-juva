'use client';
import { useEffect, useRef } from 'react';
import Reveal from '@/components/Reveal';
import type { Dict } from '@/lib/i18n';

type TestimonialItem = { readonly quote: string; readonly name: string; readonly role: string };

export default function Testimonials({ dict }: { dict: Dict }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: any; let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        ScrollTrigger.batch('.js-testimonial', {
          start: 'top 85%',
          onEnter: (els) => gsap.fromTo(els,
            { y: 50, opacity: 0, rotateX: 8 },
            { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, overwrite: 'auto' }),
        });
      }, rootRef);
    })();
    return () => { cancelled = true; try { ctx?.revert(); } catch {} };
  }, []);

  return (
    <section ref={rootRef} className="relative py-28 md:py-36 bg-bg-surface overflow-hidden">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="container-x relative">
        <Reveal>
          <span className="section-label">{dict.testimonials.label}</span>
          <h2 className="mt-4 font-display text-[clamp(36px,5.5vw,68px)] text-ink">
            {dict.testimonials.title}{' '}
            <em className="not-italic italic text-accent">{dict.testimonials.titleStrong}</em>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-3" style={{ perspective: '1200px' }}>
          {dict.testimonials.items.map((item, k) => {
            const t = item as TestimonialItem;
            return (
              <figure key={k} className="js-testimonial relative flex flex-col rounded-3xl border border-white/[0.08] bg-bg-card p-8">
                <div className="font-display text-5xl leading-none text-accent/30 select-none" aria-hidden>&ldquo;</div>
                <blockquote className="mt-3 font-display text-xl font-light leading-snug text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-label text-sm font-semibold text-accent">{t.name.charAt(0)}</span>
                  <div>
                    <div className="text-sm font-medium text-ink">{t.name}</div>
                    <div className="text-xs text-ink-muted">{t.role}</div>
                  </div>
                </figcaption>
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
