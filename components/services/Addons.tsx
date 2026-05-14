'use client';
import { useEffect, useRef } from 'react';
import Reveal from '@/components/Reveal';

type Card = { readonly title: string; readonly body: string };

export default function Addons({
  label,
  title,
  items,
}: {
  label: string;
  title: string;
  items: readonly Card[];
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
        ScrollTrigger.batch('.js-addon-card', {
          start: 'top 88%',
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: 50, opacity: 0, scale: 0.97 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.85,
                ease: 'power3.out',
                stagger: 0.1,
                overwrite: 'auto',
              }
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
          <h2 className="mt-4 font-display text-[clamp(34px,5vw,60px)] text-ink">{title}</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c, k) => (
            <article
              key={k}
              className="js-addon-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/30"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span
                className="h-2 w-2 rounded-full bg-accent/70 transition-transform duration-500 group-hover:scale-150"
                aria-hidden
              />
              <h3 className="mt-5 font-display text-2xl font-medium text-ink">{c.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
