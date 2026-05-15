'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ---------------------------------------------------------------------------
 * A small neon butterfly that follows the cursor everywhere on the site.
 *
 * Realism / 3D:
 *   - Each wing is a separate HTML element inside a CSS `perspective` context.
 *     Wings flap via `rotateY` anchored at the body — real 3D depth, not a
 *     2D horizontal squish.
 *   - Wings have a radial-gradient fill (bright magenta → core → deep magenta)
 *     plus an "eyespot" accent — reads as butterfly markings, not a triangle.
 *   - Body, head and antennae are drawn separately, in front of the wings.
 *
 * Motion:
 *   - Cursor position is smoothed by a soft spring (the chase has weight).
 *   - A slow elliptical orbit is added on top — so the butterfly hovers and
 *     wanders around the cursor like a real one wanting to land.
 *   - Wing flap is a continuous cosine oscillation (no sharp kinks).
 *
 * Performance / accessibility:
 *   - One `requestAnimationFrame` loop; positions live in motion values, no
 *     React re-renders on cursor move.
 *   - Hidden on touch / no-hover devices and on `prefers-reduced-motion`.
 *   - `pointer-events: none` so it never blocks clicks.
 * ------------------------------------------------------------------------- */

const NEON = '#FF3DCB';        // primary neon magenta
const NEON_BRIGHT = '#FF99E5'; // wing highlight
const NEON_DARK = '#A8217E';   // wing depth / eyespot core

export default function ButterflyCursor() {
  // Cursor target
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  // Smooth follow (spring) — separate from orbit so the wobble stays clean
  const followX = useSpring(cursorX, { stiffness: 70, damping: 22, mass: 0.8 });
  const followY = useSpring(cursorY, { stiffness: 70, damping: 22, mass: 0.8 });

  // Orbital offset around the cursor (not springed — applied directly)
  const orbitX = useMotionValue(0);
  const orbitY = useMotionValue(0);

  // Final render position = smoothed follow + orbit
  const renderX = useTransform([followX, orbitX], (v) => (v[0] as number) + (v[1] as number));
  const renderY = useTransform([followY, orbitY], (v) => (v[0] as number) + (v[1] as number));

  // Cosine flap driver, 0..1, transformed into per-wing rotateY angles
  const flapNorm = useMotionValue(0);
  const leftRotateY = useTransform(flapNorm, (v) => -8 + v * 85);   // -8°  → +77°
  const rightRotateY = useTransform(flapNorm, (v) => 8 - v * 85);   // +8°  → -77°

  // Subtle body tilt toward the direction of travel
  const tilt = useMotionValue(0);

  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const time = (t - startRef.current) / 1000;
      // Slow elliptical orbit — "wants to come and touch it"
      orbitX.set(Math.cos(time * 1.05) * 14);
      orbitY.set(Math.sin(time * 1.35) * 9);
      // Smooth cosine flap (no abs() kinks)
      flapNorm.set((Math.cos(time * 9.5) + 1) / 2);
      // Lean toward direction of travel
      const dx = cursorX.get() - followX.get();
      const dy = cursorY.get() - followY.get();
      const target = Math.atan2(dx, -Math.max(0.5, -dy)) * (180 / Math.PI) * 0.25;
      tilt.set(tilt.get() + (target - tilt.get()) * 0.08);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [cursorX, cursorY, followX, followY, orbitX, orbitY, flapNorm, tilt]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[55] will-change-transform"
      style={{ x: renderX, y: renderY }}
    >
      {/* Center the butterfly on the cursor and lean it toward travel */}
      <motion.div className="-translate-x-1/2 -translate-y-1/2" style={{ rotate: tilt }}>
        {/* Soft halo behind everything (not inside the 3D context, so no filter weirdness) */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: '50%', top: '50%',
            width: 80, height: 64,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(ellipse at center, ${NEON}33 0%, transparent 65%)`,
            filter: 'blur(6px)',
          }}
        />
        {/* 3D perspective context */}
        <div style={{ perspective: '600px' }}>
          <div
            className="relative"
            style={{ width: 60, height: 52, transformStyle: 'preserve-3d' }}
          >
            {/* Left wing — separate element so we can rotateY around the body axis */}
            <motion.div
              className="absolute"
              style={{
                left: 0,
                top: 4,
                width: 30,
                height: 44,
                transformStyle: 'preserve-3d',
                transformOrigin: '100% 50%',
                rotateY: leftRotateY,
              }}
            >
              <svg width="30" height="44" viewBox="0 0 30 44" style={{ display: 'block' }}>
                <defs>
                  <radialGradient id="wgl" cx="55%" cy="42%" r="78%">
                    <stop offset="0%" stopColor={NEON_BRIGHT} stopOpacity="0.95" />
                    <stop offset="50%" stopColor={NEON} stopOpacity="0.93" />
                    <stop offset="100%" stopColor={NEON_DARK} stopOpacity="0.88" />
                  </radialGradient>
                </defs>
                {/* Forewing */}
                <path
                  d="M 30 5 Q 14 -2 4 5 Q 0 14 7 17 Q 18 17 30 15 Z"
                  fill="url(#wgl)"
                />
                {/* Hindwing */}
                <path
                  d="M 30 23 Q 17 25 11 32 Q 8 40 18 41 Q 25 39 30 35 Z"
                  fill="url(#wgl)"
                />
                {/* Eyespot accent */}
                <circle cx="14" cy="9" r="2.6" fill="#FFEAF6" fillOpacity="0.55" />
                <circle cx="14" cy="9" r="1" fill={NEON_DARK} />
              </svg>
            </motion.div>

            {/* Right wing — mirrored */}
            <motion.div
              className="absolute"
              style={{
                right: 0,
                top: 4,
                width: 30,
                height: 44,
                transformStyle: 'preserve-3d',
                transformOrigin: '0% 50%',
                rotateY: rightRotateY,
              }}
            >
              <svg width="30" height="44" viewBox="0 0 30 44" style={{ display: 'block' }}>
                <defs>
                  <radialGradient id="wgr" cx="45%" cy="42%" r="78%">
                    <stop offset="0%" stopColor={NEON_BRIGHT} stopOpacity="0.95" />
                    <stop offset="50%" stopColor={NEON} stopOpacity="0.93" />
                    <stop offset="100%" stopColor={NEON_DARK} stopOpacity="0.88" />
                  </radialGradient>
                </defs>
                <path
                  d="M 0 5 Q 16 -2 26 5 Q 30 14 23 17 Q 12 17 0 15 Z"
                  fill="url(#wgr)"
                />
                <path
                  d="M 0 23 Q 13 25 19 32 Q 22 40 12 41 Q 5 39 0 35 Z"
                  fill="url(#wgr)"
                />
                <circle cx="16" cy="9" r="2.6" fill="#FFEAF6" fillOpacity="0.55" />
                <circle cx="16" cy="9" r="1" fill={NEON_DARK} />
              </svg>
            </motion.div>

            {/* Body + head + antennae — sits in front of the wings */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                width: 12,
                height: 52,
                zIndex: 1,
              }}
            >
              <svg width="12" height="52" viewBox="-6 -10 12 52" style={{ display: 'block' }}>
                {/* Body */}
                <ellipse cx="0" cy="17" rx="1.8" ry="16" fill={NEON} />
                {/* Head */}
                <circle cx="0" cy="1" r="2" fill={NEON} />
                {/* Antennae */}
                <path
                  d="M -0.6 0 Q -2.4 -4 -4 -8"
                  stroke={NEON}
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0.6 0 Q 2.4 -4 4 -8"
                  stroke={NEON}
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="-4" cy="-8" r="0.9" fill={NEON} />
                <circle cx="4" cy="-8" r="0.9" fill={NEON} />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
