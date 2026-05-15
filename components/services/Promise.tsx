'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import Reveal from '@/components/Reveal';

type PromiseCopy = {
  eyebrow: string;
  headlineA: string;
  headlineAccentA: string;
  headlineB: string;
  headlineAccentB: string;
  sub: string;
};

export default function Promise({ copy }: { copy: PromiseCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Pointer state held in motion values (no React re-renders).
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 200, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 200, damping: 30, mass: 0.6 });

  // The reveal mask for the bright text copy.
  const mask = useMotionTemplate`radial-gradient(220px circle at ${sx}px ${sy}px, black 30%, transparent 70%)`;

  // Detect touch / no-hover / reduced-motion → static bright copy, no spotlight.
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqHover = window.matchMedia('(hover: none)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setStaticMode(mqHover.matches || mqMotion.matches);
    update();
    mqHover.addEventListener?.('change', update);
    mqMotion.addEventListener?.('change', update);
    return () => {
      mqHover.removeEventListener?.('change', update);
      mqMotion.removeEventListener?.('change', update);
    };
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (staticMode) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const onLeave = () => {
    if (staticMode) return;
    // Park spotlight far off-stage so bright copy fades out.
    x.set(-9999);
    y.set(-9999);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 md:py-36 bg-bg"
    >
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <div className="container-x relative">
        <Reveal>
          <span className="section-label">{copy.eyebrow}</span>
        </Reveal>

        <div
          ref={stageRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative mt-10 md:mt-14 select-none"
        >
          {/* Soft accent glow halo following the cursor */}
          {!staticMode && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute h-[360px] w-[360px] rounded-full bg-accent/[0.06] blur-[80px]"
              style={{
                left: sx,
                top: sy,
                x: '-50%',
                y: '-50%',
              }}
            />
          )}

          {/* Base dim copy (always visible) */}
          <h2
            aria-hidden={!staticMode ? undefined : false}
            className="font-display font-medium text-[clamp(40px,7vw,116px)] leading-[1.0] tracking-[-0.025em] text-white/10"
          >
            {copy.headlineA}{' '}
            <span className="italic">{copy.headlineAccentA}</span>
            <br />
            {copy.headlineB}{' '}
            <span className="italic">{copy.headlineAccentB}</span>
          </h2>

          {/* Bright copy, revealed only inside the spotlight (or static on touch/reduced-motion) */}
          {staticMode ? (
            <h2
              aria-hidden
              className="absolute inset-0 font-display font-medium text-[clamp(40px,7vw,116px)] leading-[1.0] tracking-[-0.025em] text-ink"
            >
              {copy.headlineA}{' '}
              <span className="italic text-accent">{copy.headlineAccentA}</span>
              <br />
              {copy.headlineB}{' '}
              <span className="italic text-accent">{copy.headlineAccentB}</span>
            </h2>
          ) : (
            <motion.h2
              aria-hidden
              className="pointer-events-none absolute inset-0 font-display font-medium text-[clamp(40px,7vw,116px)] leading-[1.0] tracking-[-0.025em] text-ink"
              style={{
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            >
              {copy.headlineA}{' '}
              <span className="italic text-accent">{copy.headlineAccentA}</span>
              <br />
              {copy.headlineB}{' '}
              <span className="italic text-accent">{copy.headlineAccentB}</span>
            </motion.h2>
          )}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-10 md:mt-14 max-w-xl text-[15px] md:text-[16px] leading-relaxed text-ink-muted">
            {copy.sub}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
