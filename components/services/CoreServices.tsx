'use client';
import { useEffect, useRef } from 'react';

type CoreItem = {
  readonly kicker: string;
  readonly title: string;
  readonly outcome: string;
  readonly body: string;
  readonly bullets: readonly string[];
  readonly idealFor: string;
  readonly timeline: string;
};

type Labels = {
  readonly idealForLabel: string;
  readonly timelineLabel: string;
  readonly deliverablesLabel: string;
};

function ServiceBlock({ s, labels }: { s: CoreItem; labels: Labels }) {
  return (
    <article className="js-core-service group relative grid gap-8 rounded-3xl border border-white/[0.08] bg-bg-card p-8 transition-colors duration-500 hover:border-accent/30 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Left: number, title, outcome, body */}
      <div className="relative">
        <span className="font-display text-[clamp(56px,7vw,96px)] font-light leading-none text-accent/[0.14] select-none">
          {s.kicker}
        </span>
        <h3 className="mt-2 font-display text-3xl font-medium text-ink md:text-4xl">{s.title}</h3>
        <p className="mt-4 font-label text-[13px] uppercase tracking-[0.14em] text-accent">{s.outcome}</p>
        <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
      </div>

      {/* Right: deliverables + footer meta */}
      <div className="relative flex flex-col">
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted/70">
          {labels.deliverablesLabel}
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {s.bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-ink-muted">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent/70" />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-auto grid gap-5 border-t border-white/[0.08] pt-6 sm:grid-cols-2">
          <div>
            <div className="font-label text-[10px] uppercase tracking-[0.24em] text-ink-muted/60">
              {labels.idealForLabel}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{s.idealFor}</p>
          </div>
          <div>
            <div className="font-label text-[10px] uppercase tracking-[0.24em] text-ink-muted/60">
              {labels.timelineLabel}
            </div>
            <p className="mt-2 font-display text-xl text-ink">{s.timeline}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CoreServices({
  items,
  labels,
}: {
  items: readonly CoreItem[];
  labels: Labels;
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
        const line = root.querySelector('.js-grow-line');
        const track = root.querySelector('.js-core-track');
        if (line && track) {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              transformOrigin: 'top center',
              scrollTrigger: { trigger: track, start: 'top 75%', end: 'bottom 70%', scrub: 0.5 },
            }
          );
        }
        ScrollTrigger.batch('.js-core-service', {
          start: 'top 85%',
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: 70, opacity: 0 },
              { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.14, overwrite: 'auto' }
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
    <section ref={rootRef} className="relative pb-24 pt-16 md:pb-32 md:pt-20">
      <div className="container-x relative">
        <div className="js-core-track relative md:pl-10">
          {/* Organic growth line — hidden on mobile, sits left of the stacked blocks */}
          <div className="absolute left-3 top-0 hidden h-full w-px bg-white/[0.06] md:block" aria-hidden />
          <div
            className="js-grow-line absolute left-3 top-0 hidden h-full w-px bg-gradient-to-b from-accent via-accent/60 to-accent/15 md:block"
            style={{ transformOrigin: 'top center' }}
            aria-hidden
          />
          <div className="grid gap-6 md:gap-8">
            {items.map((s, k) => (
              <ServiceBlock key={k} s={s} labels={labels} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
