'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import { type Locale, type Dict } from '@/lib/i18n';

// Default hero visual on capable desktops is a code-built React Three Fiber
// 3D plant (Hero3DPlant). If NEXT_PUBLIC_SPLINE_SCENE is set, a Spline scene
// is used instead. Both are lazy-loaded (ssr:false) so they never touch the
// initial bundle. Mobile / low-end / reduced-motion falls back to TreeSVG.
const Hero3DPlant = dynamic(() => import('@/components/Hero3DPlant'), {
  ssr: false,
  loading: () => null,
});
const SplineScene = dynamic(
  () => import('@/components/SplineScene').then((m) => m.SplineScene),
  { ssr: false, loading: () => null },
);
const SPLINE_SCENE = process.env.NEXT_PUBLIC_SPLINE_SCENE || '';

function TreeSVG() {
  return (
    <svg
      viewBox="0 0 400 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <path className="js-trunk" d="M 200 600 Q 198 500 200 400 Q 202 290 200 180 Q 198 130 200 90" stroke="#C8FF3D" strokeWidth="2" fill="none" strokeOpacity="0.85" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path className="js-branch" d="M 200 420 Q 165 410 128 392" stroke="#C8FF3D" strokeWidth="1.4" fill="none" strokeOpacity="0.75" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path className="js-branch" d="M 200 400 Q 235 388 272 370" stroke="#C8FF3D" strokeWidth="1.4" fill="none" strokeOpacity="0.75" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path className="js-branch" d="M 200 295 Q 158 275 113 252" stroke="#C8FF3D" strokeWidth="1.2" fill="none" strokeOpacity="0.7" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path className="js-branch" d="M 200 275 Q 245 252 292 228" stroke="#C8FF3D" strokeWidth="1.2" fill="none" strokeOpacity="0.7" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path className="js-branch" d="M 200 185 Q 175 168 148 150" stroke="#C8FF3D" strokeWidth="1" fill="none" strokeOpacity="0.65" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path className="js-branch" d="M 200 168 Q 226 150 252 134" stroke="#C8FF3D" strokeWidth="1" fill="none" strokeOpacity="0.65" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <ellipse className="js-leaf" cx="123" cy="390" rx="9" ry="13" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(-25 123 390)" />
      <ellipse className="js-leaf" cx="277" cy="368" rx="9" ry="13" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(25 277 368)" />
      <ellipse className="js-leaf" cx="108" cy="250" rx="8" ry="12" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(-30 108 250)" />
      <ellipse className="js-leaf" cx="297" cy="226" rx="8" ry="12" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(30 297 226)" />
      <ellipse className="js-leaf" cx="144" cy="148" rx="7" ry="11" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(-35 144 148)" />
      <ellipse className="js-leaf" cx="256" cy="132" rx="7" ry="11" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(35 256 132)" />
      <ellipse className="js-leaf" cx="200" cy="78" rx="7" ry="11" fill="#C8FF3D" fillOpacity="0.5" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" />
      <ellipse className="js-leaf" cx="180" cy="92" rx="6" ry="9" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(-22 180 92)" />
      <ellipse className="js-leaf" cx="220" cy="98" rx="6" ry="9" fill="#C8FF3D" fillOpacity="0.45" stroke="#C8FF3D" strokeWidth="0.6" strokeOpacity="0.7" transform="rotate(22 220 98)" />
    </svg>
  );
}

function WordRotator({ words }: { words: readonly string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className="relative inline-block align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block italic text-accent"
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
      <span className="invisible italic">{words[0]}</span>
    </span>
  );
}

function useShould3D() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let webgl = false;
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {}
    // memory & connection hints (avoid 3D on slow / low-memory devices)
    const nav = navigator as unknown as { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
    const enoughMemory = (nav.deviceMemory ?? 4) >= 4;
    const fastNet = !nav.connection?.saveData && !['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType ?? '');
    setEnabled(isDesktop && webgl && !reducedMotion && enoughMemory && fastNet);
  }, []);
  return enabled;
}

export default function Hero({ locale, dict }: { locale: Locale; dict: Dict }) {
  const sectionRef = useRef<HTMLElement>(null);
  const use3D = useShould3D();

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    let ctx: any;
    let cancelled = false;

    (async () => {
      const { gsap } = await import('gsap');
      if (cancelled) return;

      ctx = gsap.context(() => {
        // Hide content while the tree appears
        gsap.set(['.js-eyebrow', '.js-headline-line', '.js-sub', '.js-cta', '.js-stat', '.js-scroll-hint'], {
          opacity: 0,
          y: 24,
        });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // SVG entry timeline (only matters when SVG is rendered)
        tl.to('.js-trunk', { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, 0);
        tl.to('.js-branch', { strokeDashoffset: 0, duration: 0.7, stagger: 0.13, ease: 'power2.out' }, 0.4);
        tl.fromTo(
          '.js-leaf',
          { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
          { scale: 1, opacity: 1, duration: 0.55, stagger: 0.13, ease: 'back.out(2)' },
          1.0,
        );

        // Hero content fades in (works for both 3D and SVG modes)
        tl.to('.js-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 1.6);
        tl.to('.js-headline-line', { opacity: 1, y: 0, duration: 0.85, stagger: 0.1 }, 1.7);
        tl.to('.js-sub', { opacity: 1, y: 0, duration: 0.7 }, 2.0);
        tl.to('.js-cta', { opacity: 1, y: 0, duration: 0.7 }, 2.2);
        tl.to('.js-stat', { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 2.4);
        tl.to('.js-scroll-hint', { opacity: 1, y: 0, duration: 0.6 }, 2.7);
      }, root);
    })();

    return () => {
      cancelled = true;
      try { ctx?.revert(); } catch {}
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate min-h-dvh flex flex-col justify-center overflow-hidden pt-28 pb-20">
      {/* Ambient orb */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[18%] left-[10%] w-[520px] h-[520px] rounded-full bg-accent/[0.05] blur-[100px]" />
      </div>

      {/* 3D plant — right side on desktop; SVG fallback otherwise */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {use3D ? (
          <div className="absolute right-0 top-0 h-full w-full lg:w-[54%] opacity-95 pointer-events-auto">
            {SPLINE_SCENE ? (
              <SplineScene scene={SPLINE_SCENE} className="!w-full !h-full" />
            ) : (
              <Hero3DPlant />
            )}
          </div>
        ) : (
          <div className="absolute right-0 bottom-0 w-[280px] sm:w-[400px] lg:w-[440px] h-full max-h-[680px] opacity-50">
            <TreeSVG />
          </div>
        )}
      </div>

      {/* Soft vignette — keeps the left-side text legible over the scene */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-bg via-bg/70 to-bg/30 lg:from-bg lg:via-bg/85 lg:to-transparent" aria-hidden />

      <div className="container-x relative z-10">
        <div className="lg:max-w-[56%]">
          <div className="js-eyebrow">
            <span className="section-label">{dict.hero.eyebrow}</span>
          </div>

          <h1 className="mt-6 font-display text-[clamp(46px,7vw,104px)] leading-[0.96] tracking-[-0.02em] text-ink">
            <span className="js-headline-line block">{dict.hero.titleA}</span>
            <span className="js-headline-line block">
              <WordRotator words={dict.hero.titleRotators} />
            </span>
          </h1>

          <p className="js-sub mt-8 max-w-[480px] text-[17px] leading-relaxed text-ink-muted">{dict.hero.sub}</p>

          <div className="js-cta mt-10 flex flex-wrap gap-4">
            <MagneticButton href={`/${locale}/contact`} className="btn-primary">
              {dict.hero.primaryCta} <ArrowRight size={16} />
            </MagneticButton>
            <MagneticButton href={`/${locale}/work`} className="btn-ghost">
              {dict.hero.secondaryCta}
            </MagneticButton>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-3">
            {[dict.hero.proofA, dict.hero.proofB, dict.hero.proofC].map((s, i) => (
              <div key={i} className="js-stat flex items-center gap-2.5 text-sm text-ink-muted">
                <span className="h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="js-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10" aria-hidden>
        <div className="h-8 w-px bg-gradient-to-b from-accent/50 to-transparent animate-floatY" />
      </div>
    </section>
  );
}
