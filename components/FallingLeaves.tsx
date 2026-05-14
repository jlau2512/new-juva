'use client';

import { useEffect, useState } from 'react';

/* ---------------------------------------------------------------------------
 * Home-page ambient layer: accent leaves + occasional brand words detach from
 * the hero tree's canopy (upper-right zone) and drift down-and-across the page
 * with a wind-blown flutter. Pure CSS animations (transform + opacity only) —
 * runs on the compositor thread, zero main-thread cost, smooth on every device.
 * Mounts ~2.8s after load so it begins once the hero tree has grown.
 * Respects prefers-reduced-motion (renders nothing).
 * ------------------------------------------------------------------------- */

const WORDS = ['grow', 'craft', 'brand', 'design', 'motion', 'ideas', 'build', 'create', 'shape', 'launch'];

const LEAF_PATHS = [
  'M7 0C11 4 13 10 7 18 1 10 3 4 7 0Z',
  'M6 0C10 3 11 9 6 16 1 9 2 3 6 0Z',
  'M8 1C12 6 12 12 7 17 3 12 4 6 8 1Z',
];

type Particle = {
  id: number;
  kind: 'leaf' | 'word';
  word?: string;
  leftVw: number; // spawn X — clustered over the tree canopy (right side)
  originTopVh: number; // spawn Y — within the canopy band, not the page top
  driftVw: number; // wind carries it leftward across the page as it falls
  fallDur: number;
  delay: number;
  scale: number;
  baseOpacity: number;
  swayDur: number;
  rotFrom: number;
  rotTo: number;
  swayPx: number;
  leafVariant: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function generate(): Particle[] {
  const isMobile = window.innerWidth < 768;
  const leafCount = isMobile ? 11 : 18;
  const wordCount = isMobile ? 3 : 6;
  const out: Particle[] = [];
  let id = 0;

  for (let i = 0; i < leafCount; i++) {
    const fallDur = rand(11, 22);
    out.push({
      id: id++,
      kind: 'leaf',
      leftVw: rand(46, 99), // over the hero tree (right ~half)
      originTopVh: rand(3, 44), // canopy band
      driftVw: rand(-72, 6), // blown leftward, across the whole page
      fallDur,
      delay: -rand(0, fallDur), // negative → already mid-fall on mount
      scale: rand(0.55, 1.25),
      baseOpacity: rand(0.25, 0.6),
      swayDur: rand(2.4, 4.8),
      rotFrom: rand(-40, -10),
      rotTo: rand(15, 45),
      swayPx: rand(8, 22),
      leafVariant: Math.floor(rand(0, LEAF_PATHS.length)),
    });
  }

  for (let i = 0; i < wordCount; i++) {
    const fallDur = rand(14, 24);
    out.push({
      id: id++,
      kind: 'word',
      word: WORDS[Math.floor(rand(0, WORDS.length))],
      leftVw: rand(50, 92),
      originTopVh: rand(6, 40),
      driftVw: rand(-56, 4),
      fallDur,
      delay: -rand(0, fallDur),
      scale: rand(0.85, 1.35),
      baseOpacity: rand(0.18, 0.42),
      swayDur: rand(3, 6),
      rotFrom: rand(-13, -4),
      rotTo: rand(4, 13),
      swayPx: rand(6, 16),
      leafVariant: 0,
    });
  }

  return out;
}

function ParticleEl({ p }: { p: Particle }) {
  return (
    <div
      className="absolute will-change-transform"
      style={{
        left: `${p.leftVw}vw`,
        top: `${p.originTopVh}vh`,
        opacity: p.baseOpacity,
        animation: `leaf-fall ${p.fallDur}s linear ${p.delay}s infinite`,
        // @ts-expect-error -- CSS custom property
        '--drift': `${p.driftVw}vw`,
      }}
    >
      <div
        className="will-change-transform"
        style={{
          animation: `leaf-sway ${p.swayDur}s ease-in-out infinite`,
          // @ts-expect-error -- CSS custom properties
          '--rot-from': `${p.rotFrom}deg`,
          '--rot-to': `${p.rotTo}deg`,
          '--sway': `${p.swayPx}px`,
        }}
      >
        {p.kind === 'leaf' ? (
          <div style={{ transform: `scale(${p.scale})` }}>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden>
              <path d={LEAF_PATHS[p.leafVariant] ?? LEAF_PATHS[0]} fill="#C8FF3D" />
            </svg>
          </div>
        ) : (
          <span
            className="font-display italic text-accent select-none whitespace-nowrap"
            style={{ fontSize: `${p.scale}rem` }}
          >
            {p.word}
          </span>
        )}
      </div>
    </div>
  );
}

export default function FallingLeaves() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setParticles(generate()), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[40] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <ParticleEl key={p.id} p={p} />
      ))}
    </div>
  );
}
