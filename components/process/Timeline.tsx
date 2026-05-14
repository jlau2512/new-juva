'use client';
import { useEffect, useRef } from 'react';

type ProcessStep = {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  readonly detail: string;
  readonly outcome: string;
  readonly deliverable: string;
  readonly duration: string;
};

type Labels = {
  readonly deliverableLabel: string;
  readonly durationLabel: string;
};

export default function Timeline({
  steps,
  labels,
}: {
  steps: readonly ProcessStep[];
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
        const line = root.querySelector('.js-line');
        const track = root.querySelector('.js-timeline');
        if (line && track) {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              transformOrigin: 'top center',
              scrollTrigger: { trigger: track, start: 'top 78%', end: 'bottom 65%', scrub: 0.5 },
            }
          );
        }
        ScrollTrigger.batch('.js-phase', {
          start: 'top 84%',
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: 64, opacity: 0 },
              { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.16, overwrite: 'auto' }
            ),
        });
        ScrollTrigger.batch('.js-phase-dot', {
          start: 'top 84%',
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.16, overwrite: 'auto' }
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
    <section ref={rootRef} className="relative py-24 md:py-32">
      <div className="container-x relative">
        <div className="js-timeline relative md:pl-12">
          {/* Static rail + growing accent line — left of the stacked phases */}
          <div className="absolute left-4 top-0 hidden h-full w-px bg-white/[0.06] md:block" aria-hidden />
          <div
            className="js-line absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-accent via-accent/60 to-accent/15 md:block"
            style={{ transformOrigin: 'top center' }}
            aria-hidden
          />

          <ul className="grid gap-6 md:gap-8">
            {steps.map((s, k) => (
              <li
                key={k}
                className="js-phase group relative grid gap-8 rounded-3xl border border-white/[0.08] bg-bg-card p-8 transition-colors duration-500 hover:border-accent/30 md:grid-cols-[0.85fr_1.15fr] md:gap-12 md:p-12"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Timeline dot — aligns with the rail on desktop */}
                <span className="js-phase-dot absolute -left-[34px] top-14 hidden md:block" aria-hidden>
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute h-4 w-4 rounded-full bg-accent/20 animate-pulseRing" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(200,255,61,0.6)]" />
                  </span>
                </span>

                {/* Left: number + title + outcome */}
                <div className="relative">
                  <span className="font-display text-[clamp(64px,8vw,110px)] font-light leading-none text-accent/[0.14] select-none">
                    {s.n}
                  </span>
                  <h3 className="mt-2 font-display text-3xl font-medium text-ink md:text-4xl">{s.title}</h3>
                  <p className="mt-4 font-label text-[13px] uppercase tracking-[0.14em] text-accent">
                    {s.outcome}
                  </p>
                </div>

                {/* Right: detail + meta row */}
                <div className="relative flex flex-col">
                  <p className="text-[15px] leading-relaxed text-ink-muted">{s.detail}</p>
                  <div className="mt-auto grid gap-5 border-t border-white/[0.08] pt-6 sm:grid-cols-2">
                    <div>
                      <div className="font-label text-[10px] uppercase tracking-[0.24em] text-ink-muted/60">
                        {labels.deliverableLabel}
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{s.deliverable}</p>
                    </div>
                    <div>
                      <div className="font-label text-[10px] uppercase tracking-[0.24em] text-ink-muted/60">
                        {labels.durationLabel}
                      </div>
                      <p className="mt-2 font-display text-xl text-ink">{s.duration}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
