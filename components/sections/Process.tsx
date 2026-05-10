'use client';
import { useEffect, useRef } from 'react';
import Reveal from '@/components/Reveal';
import type { Dict } from '@/lib/i18n';

type ProcessStep = { readonly n: string; readonly title: string; readonly body: string };

export default function Process({ dict }: { dict: Dict }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let ctx: any; let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const line = root.querySelector('.js-line');
        if (line) {
          gsap.fromTo(line, { scaleY: 0 }, {
            scaleY: 1, ease: 'none', transformOrigin: 'top center',
            scrollTrigger: { trigger: root.querySelector('.js-timeline'), start: 'top 75%', end: 'bottom 60%', scrub: 0.5 },
          });
        }
        ScrollTrigger.batch('.js-step', {
          start: 'top 80%',
          onEnter: (els) => gsap.fromTo(els,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.15, overwrite: 'auto' }),
        });
        ScrollTrigger.batch('.js-step-dot', {
          start: 'top 80%',
          onEnter: (els) => gsap.fromTo(els,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.15, overwrite: 'auto' }),
        });
      }, root);
    })();
    return () => { cancelled = true; try { ctx?.revert(); } catch {} };
  }, []);

  return (
    <section ref={rootRef} id="process" className="relative py-28 md:py-36 bg-bg-surface">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="container-x relative">
        <Reveal>
          <span className="section-label">{dict.process.label}</span>
          <h2 className="mt-4 font-display text-[clamp(36px,5.5vw,68px)] text-ink">
            {dict.process.title}{' '}
            <em className="not-italic italic text-accent">{dict.process.titleStrong}</em>
          </h2>
        </Reveal>

        <div className="js-timeline relative mt-20">
          <div className="absolute left-5 top-0 h-full w-px bg-white/[0.06] md:left-1/2 md:-translate-x-1/2" />
          <div className="js-line absolute left-5 top-0 h-full w-px bg-gradient-to-b from-accent via-accent/60 to-accent/20 md:left-1/2 md:-translate-x-1/2" style={{ transformOrigin: 'top center' }} />
          <ul>
            {dict.process.steps.map((step, k) => {
              const s = step as ProcessStep;
              const isRight = k % 2 === 1;
              return (
                <li key={k} className="relative grid gap-0 md:grid-cols-2 md:gap-0">
                  <div className={`js-step relative pb-16 pl-14 md:pl-0 md:pb-20 ${isRight ? 'md:col-start-2 md:pl-14' : 'md:pr-14 md:text-right'}`}>
                    <div className={`font-display text-[clamp(72px,10vw,120px)] font-light leading-none text-accent/[0.12] select-none`}>{s.n}</div>
                    <div className="mt-1">
                      <h3 className="font-display text-2xl md:text-3xl font-medium text-ink">{s.title}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted max-w-sm">{s.body}</p>
                    </div>
                  </div>
                  <span className="js-step-dot absolute left-5 top-10 -translate-x-1/2 md:left-1/2">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute h-4 w-4 rounded-full bg-accent/20 animate-pulseRing" />
                      <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(200,255,61,0.6)]" />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
