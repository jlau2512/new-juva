'use client';
import { useEffect, useRef } from 'react';

type IntroCopy = {
  eyebrow: string;
  headlineLead: string;
  headlineAccent: string;
  sub: string;
};

export default function WorkIntro({ copy }: { copy: IntroCopy }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    let ctx: any;
    let cancelled = false;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      const { gsap } = await import('gsap');
      if (cancelled) return;

      ctx = gsap.context(() => {
        const targets = ['.js-w-eyebrow', '.js-w-line', '.js-w-sub'];

        if (reducedMotion) {
          gsap.set(targets, { opacity: 1, y: 0, filter: 'blur(0px)' });
          return;
        }

        gsap.set(targets, { opacity: 0, y: 24, filter: 'blur(8px)' });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(
          '.js-w-eyebrow',
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 },
          0.2,
        );
        tl.to(
          '.js-w-line',
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.14,
          },
          0.35,
        );
        tl.to(
          '.js-w-sub',
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 },
          0.95,
        );
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
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden pt-32 md:pt-40 pb-16 md:pb-24"
    >
      {/* Ambient orb */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[12%] left-[4%] w-[480px] h-[480px] rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full px-6 sm:px-10 lg:pl-16 xl:pl-24 2xl:pl-32">
        <div className="max-w-[44rem] lg:max-w-[52rem]">
          <span className="js-w-eyebrow section-label inline-block">
            {copy.eyebrow}
          </span>

          <h1 className="mt-5 font-display font-medium text-[clamp(46px,7vw,108px)] leading-[0.96] tracking-[-0.025em] text-ink">
            <span className="js-w-line block">{copy.headlineLead}</span>
            <span className="js-w-line block italic text-accent">
              {copy.headlineAccent}
            </span>
          </h1>

          <p className="js-w-sub mt-7 max-w-[44rem] text-[17px] leading-relaxed text-ink-muted">
            {copy.sub}
          </p>
        </div>
      </div>
    </section>
  );
}
