'use client';
import { useEffect, useRef } from 'react';
import Reveal from '@/components/Reveal';
import type { Dict } from '@/lib/i18n';

type ProcessStep = {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  readonly outcome: string;
};

/**
 * Home-page Process section — "The growing branch journey".
 *
 * A natural-scroll vertical section. A custom organic Bezier branch (SVG path)
 * runs down the timeline and "grows" via strokeDashoffset scrub as the viewer
 * scrolls through. At each of the 4 phase nodes, a teardrop leaf marker
 * (matching the brand TreeSVG / FallingLeaves leaves) unfurls — scale 0→1
 * with a small rotate, plus a one-shot accent pulse halo. Each phase card
 * slides in from the side opposite its leaf with its huge faded backdrop
 * number "blooming" up from 0.85→1 behind the text.
 *
 * Respects prefers-reduced-motion — everything snaps to its final state and
 * the timeline / scrub are skipped.
 */
export default function Process({ dict }: { dict: Dict }) {
  const rootRef = useRef<HTMLElement>(null);

  // 4 nodes, evenly distributed down a tall narrow viewBox (0 0 200 1200).
  // Y values are tuned so each leaf sits near the vertical centre of its
  // corresponding row in the CSS grid below — the cards have generous min-h
  // so the math stays stable across breakpoints.
  // The path weaves left-right between cards via control points that pull
  // the curve toward whichever side the card sits on.
  const nodes = [
    { x: 100, y: 150 },
    { x: 100, y: 430 },
    { x: 100, y: 720 },
    { x: 100, y: 1020 },
  ];

  // Organic Bezier — alternating C-curve weave through the 4 nodes.
  const branchD = [
    `M ${nodes[0].x} 40`,
    `C 60 90, 140 110, ${nodes[0].x} ${nodes[0].y}`,
    `C 60 220, 145 320, ${nodes[1].x} ${nodes[1].y}`,
    `C 150 520, 55 620, ${nodes[2].x} ${nodes[2].y}`,
    `C 50 810, 155 920, ${nodes[3].x} ${nodes[3].y}`,
    `C 145 1100, 95 1140, 100 1180`,
  ].join(' ');

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
        const reduced =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ---- Initial states (no flash of fully-visible content) ------------
        gsap.set('.js-branch-path', { strokeDashoffset: 1 });
        gsap.set('.js-branch-leaf', {
          scale: 0,
          opacity: 0,
          rotation: -18,
          transformOrigin: '50% 50%',
        });
        gsap.set('.js-branch-pulse', { scale: 0.6, opacity: 0 });
        gsap.set('.js-phase-card', { opacity: 0 });
        gsap.set('.js-phase-number', { scale: 0.85, opacity: 0 });
        gsap.set('.js-phase-title-word', { yPercent: 105, opacity: 0 });
        gsap.set('.js-phase-outcome', { y: 20, opacity: 0 });
        gsap.set('.js-phase-body', { y: 24, opacity: 0 });
        gsap.set('.js-phase-progress', { opacity: 0, y: 8 });

        if (reduced) {
          gsap.set(
            [
              '.js-branch-path',
              '.js-branch-leaf',
              '.js-branch-pulse',
              '.js-phase-card',
              '.js-phase-number',
              '.js-phase-title-word',
              '.js-phase-outcome',
              '.js-phase-body',
              '.js-phase-progress',
            ],
            { clearProps: 'all' }
          );
          return;
        }

        // ---- Branch grows on scrub -----------------------------------------
        const track = root.querySelector('.js-branch-track');
        if (track) {
          gsap.to('.js-branch-path', {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: track,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: 0.5,
            },
          });
        }

        // ---- Per-phase reveal timeline -------------------------------------
        const phases = gsap.utils.toArray<HTMLElement>('.js-phase');
        phases.forEach((phase, idx) => {
          const side = phase.dataset.side === 'right' ? 1 : -1;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: phase,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          });

          // Leaf unfurls — scale-pop + de-rotate
          tl.to(
            phase.querySelector('.js-branch-leaf'),
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.7,
              ease: 'back.out(1.8)',
            },
            0
          );

          // One-shot accent pulse around the leaf
          tl.to(
            phase.querySelector('.js-branch-pulse'),
            {
              scale: 1.9,
              opacity: 0.55,
              duration: 0.45,
              ease: 'power2.out',
            },
            0.05
          ).to(
            phase.querySelector('.js-branch-pulse'),
            { opacity: 0, duration: 0.6, ease: 'power2.out' },
            '>-0.15'
          );

          // Thin connector trace from leaf out to card
          tl.fromTo(
            phase.querySelector('.js-branch-connector'),
            { scaleX: 0, opacity: 0.8 },
            {
              scaleX: 1,
              opacity: 0,
              duration: 0.55,
              ease: 'power2.out',
            },
            0.15
          );

          // Backdrop number blooms
          tl.to(
            phase.querySelector('.js-phase-number'),
            {
              scale: 1,
              opacity: 1,
              duration: 1.0,
              ease: 'power3.out',
            },
            0.1
          );

          // Card slides in from its side
          tl.fromTo(
            phase.querySelector('.js-phase-card'),
            { x: side * 60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.95,
              ease: 'power3.out',
            },
            0.1
          );

          // Title words sharpen into focus
          tl.to(
            phase.querySelectorAll('.js-phase-title-word'),
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power3.out',
              stagger: 0.04,
            },
            0.25
          );

          // Outcome line
          tl.to(
            phase.querySelector('.js-phase-outcome'),
            { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
            0.4
          );

          // Body copy
          tl.to(
            phase.querySelector('.js-phase-body'),
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
            0.5
          );

          // Top-right phase indicator updates as each phase enters
          ScrollTrigger.create({
            trigger: phase,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => updateIndicator(idx),
            onEnterBack: () => updateIndicator(idx),
          });
        });

        function updateIndicator(idx: number) {
          const indicator = root!.querySelector<HTMLElement>('.js-phase-indicator-num');
          if (!indicator) return;
          gsap.fromTo(
            indicator,
            { yPercent: -100, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.45,
              ease: 'power3.out',
              onStart: () => {
                indicator.textContent = String(idx + 1).padStart(2, '0');
              },
            }
          );
        }

        // Indicator reveal once the section is in view
        ScrollTrigger.create({
          trigger: root,
          start: 'top 70%',
          once: true,
          onEnter: () =>
            gsap.to('.js-phase-progress', {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
            }),
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

  const steps = dict.process.steps as readonly ProcessStep[];
  const total = steps.length;

  return (
    <section
      ref={rootRef}
      id="process"
      className="relative overflow-hidden bg-bg-surface py-32 md:py-44"
    >
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      {/* Ambient orb to add depth behind the branch */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/[0.035] blur-[120px]" />
      </div>

      <div className="container-x relative">
        {/* Heading row + Phase indicator */}
        <div className="flex items-start justify-between gap-8">
          <Reveal>
            <span className="section-label">{dict.process.label}</span>
            <h2 className="mt-4 font-display text-[clamp(34px,5vw,62px)] tracking-[-0.025em] text-ink">
              {dict.process.title}{' '}
              <em className="not-italic italic text-accent">
                {dict.process.titleStrong}
              </em>
            </h2>
          </Reveal>

          {/* Phase X / 04 indicator — desktop only, animates as each phase enters */}
          <div
            className="js-phase-progress mt-8 hidden shrink-0 items-baseline gap-3 md:flex"
            aria-hidden
          >
            <span className="font-label text-[11px] uppercase tracking-[0.22em] text-ink-muted/70">
              Phase
            </span>
            <span className="relative inline-flex h-[1.1em] overflow-hidden font-display text-[28px] leading-none text-accent">
              <span className="js-phase-indicator-num inline-block">01</span>
            </span>
            <span className="font-display text-[28px] leading-none text-ink-muted/40">
              / 0{total}
            </span>
          </div>
        </div>

        {/* Timeline track */}
        <div className="js-branch-track relative mt-24 md:mt-28">
          {/* Organic branch SVG — full-height, behind everything */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 200 1200"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* Faint static ghost rail */}
            <path
              d={branchD}
              stroke="#C8FF3D"
              strokeOpacity="0.08"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            {/* Growing accent branch */}
            <path
              className="js-branch-path"
              d={branchD}
              stroke="#C8FF3D"
              strokeOpacity="0.85"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ul className="relative">
            {steps.map((s, k) => {
              const isRight = k % 2 === 1;
              const titleWords = s.title.split(' ');
              return (
                <li
                  key={k}
                  data-side={isRight ? 'right' : 'left'}
                  className="js-phase relative grid min-h-[280px] grid-cols-1 items-center pb-20 last:pb-0 md:min-h-[300px] md:grid-cols-[1fr_120px_1fr] md:pb-24"
                >
                  {/* Mobile leaf column — between content. On desktop sits in the centre track. */}
                  {/* Card */}
                  <div
                    className={[
                      'pl-14 md:pl-0',
                      isRight
                        ? 'md:col-start-3 md:pl-12'
                        : 'md:col-start-1 md:pr-12 md:text-right',
                    ].join(' ')}
                  >
                    <div className="js-phase-card relative">
                      {/* Huge faded backdrop number */}
                      <div
                        className={[
                          'js-phase-number pointer-events-none absolute -top-[0.35em] select-none font-display font-light leading-none text-accent/[0.10]',
                          'text-[clamp(96px,12vw,180px)]',
                          isRight ? '-left-2' : '-right-2 md:left-auto',
                        ].join(' ')}
                        aria-hidden
                      >
                        {s.n}
                      </div>

                      <div className="relative">
                        <h3 className="font-display text-[clamp(28px,3.4vw,46px)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
                          {titleWords.map((w, i) => (
                            <span
                              key={i}
                              className="inline-block overflow-hidden align-bottom"
                            >
                              <span
                                className={[
                                  'js-phase-title-word inline-block',
                                  i === titleWords.length - 1
                                    ? 'italic text-accent'
                                    : '',
                                ].join(' ')}
                              >
                                {w}
                                {i < titleWords.length - 1 ? ' ' : ''}
                              </span>
                            </span>
                          ))}
                        </h3>

                        <p
                          className={[
                            'js-phase-outcome mt-4 font-display text-[15px] italic leading-snug text-accent md:text-[17px]',
                            isRight ? '' : 'md:ml-auto',
                            'max-w-[34ch]',
                          ].join(' ')}
                        >
                          {s.outcome}
                        </p>

                        <p
                          className={[
                            'js-phase-body mt-5 text-[15px] leading-relaxed text-ink-muted',
                            'max-w-[42ch]',
                            isRight ? '' : 'md:ml-auto',
                          ].join(' ')}
                        >
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Centre track — leaf node + pulse + connector */}
                  <div className="pointer-events-none absolute left-5 top-1/2 -translate-x-1/2 -translate-y-1/2 md:left-1/2 md:relative md:col-start-2 md:row-start-1 md:top-auto md:translate-x-0 md:translate-y-0 md:flex md:h-full md:items-center md:justify-center">
                    <div className="relative flex items-center justify-center">
                      {/* Perma-glow halo */}
                      <span
                        className="absolute inset-0 m-auto h-[80px] w-[80px] rounded-full bg-accent/[0.06] blur-[40px]"
                        aria-hidden
                      />
                      {/* One-shot pulse ring (animated on enter) */}
                      <span
                        className="js-branch-pulse absolute h-10 w-10 rounded-full border border-accent/60"
                        aria-hidden
                      />
                      {/* Leaf marker */}
                      <svg
                        className="js-branch-leaf relative"
                        width="28"
                        height="36"
                        viewBox="0 0 28 36"
                        fill="none"
                        aria-hidden
                      >
                        <ellipse
                          cx="14"
                          cy="18"
                          rx="9"
                          ry="14"
                          fill="#C8FF3D"
                          fillOpacity="0.55"
                          stroke="#C8FF3D"
                          strokeOpacity="0.85"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M 14 6 Q 14 18 14 30"
                          stroke="#080807"
                          strokeOpacity="0.25"
                          strokeWidth="0.6"
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Connector micro-line — fires once on reveal */}
                      <span
                        className={[
                          'js-branch-connector pointer-events-none absolute top-1/2 hidden h-px w-[60px] origin-left bg-gradient-to-r from-accent/70 to-transparent md:block',
                          isRight ? 'left-1/2' : 'right-1/2 origin-right rotate-180',
                        ].join(' ')}
                        aria-hidden
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
