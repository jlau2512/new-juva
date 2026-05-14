'use client';
import { useEffect, useRef } from 'react';
import Reveal from '@/components/Reveal';

type Principle = { readonly title: string; readonly body: string };

export default function Principles({
  label,
  title,
  items,
}: {
  label: string;
  title: string;
  items: readonly Principle[];
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let ctx: any;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        ScrollTrigger.batch('.js-principle', {
          start: 'top 88%',
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: 44, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.12, overwrite: 'auto' }
            ),
        });
      }, root);
    })();
    return () => {
      cancelled = true;
      try {
        ctx?.revert();
      } catch {}
    };
  }, []);

  return (
    <section ref={rootRef} className="relative py-24 md:py-32 bg-bg-surface">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="container-x relative">
        <Reveal>
          <span className="section-label">{label}</span>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(34px,5vw,60px)] text-ink">{title}</h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
          {items.map((p, k) => (
            <div
              key={k}
              className="js-principle group relative flex flex-col bg-bg-card p-8 transition-colors duration-500 hover:bg-bg-card/60 md:p-10"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-light text-accent/30">
                  {String(k + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-white/[0.08] transition-colors duration-500 group-hover:bg-accent/30" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-medium text-ink">{p.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
