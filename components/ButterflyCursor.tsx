'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ---------------------------------------------------------------------------
 * A single small neon butterfly that follows the cursor everywhere on the
 * site. It chases via spring physics (so it lags slightly) and orbits in a
 * lazy ellipse around the pointer — like a curious creature that wants to
 * land. Wings flap via a scaleX oscillation anchored at the body. Hidden on
 * touch / no-hover / reduced-motion devices. Pointer-events: none, so it
 * never blocks clicks.
 * ------------------------------------------------------------------------- */

// Neon magenta — contrasts cleanly against the dark bg and the lime accent.
const NEON = '#FF3DCB';

export default function ButterflyCursor() {
  // Motion values declared unconditionally (Rules of Hooks).
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const targetX = useMotionValue(-200);
  const targetY = useMotionValue(-200);
  // Spring lerp → butterfly "chases" the cursor with weight.
  const bx = useSpring(targetX, { stiffness: 90, damping: 18, mass: 0.6 });
  const by = useSpring(targetY, { stiffness: 90, damping: 18, mass: 0.6 });
  // Time-driven flap value, transformed into a scaleX oscillation.
  const flap = useMotionValue(0);
  const wingScale = useTransform(flap, (t) => 0.35 + Math.abs(Math.sin(t * 14)) * 0.65);

  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only on devices with a real pointer + no reduced-motion preference.
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
      // Orbit around the cursor — "wants to come and touch it".
      const orbitR = 16;
      const ox = Math.cos(time * 1.3) * orbitR;
      const oy = Math.sin(time * 1.8) * orbitR * 0.6;
      targetX.set(cursorX.get() + ox);
      targetY.set(cursorY.get() + oy);
      flap.set(time);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [cursorX, cursorY, targetX, targetY, flap]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[55] will-change-transform"
      style={{ x: bx, y: by }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <svg
          width="38"
          height="32"
          viewBox="-19 -16 38 32"
          style={{ filter: `drop-shadow(0 0 6px ${NEON}aa)` }}
        >
          {/* Left wing — anchored at the body, scales horizontally to flap */}
          <motion.path
            d="M -1 -3 Q -16 -14 -16 -2 Q -16 9 -8 7 Q -3 5 -1 3 Z"
            fill={NEON}
            fillOpacity={0.92}
            style={{
              scaleX: wingScale,
              transformBox: 'fill-box',
              transformOrigin: '100% 50%',
            }}
          />
          {/* Right wing — mirrored */}
          <motion.path
            d="M 1 -3 Q 16 -14 16 -2 Q 16 9 8 7 Q 3 5 1 3 Z"
            fill={NEON}
            fillOpacity={0.92}
            style={{
              scaleX: wingScale,
              transformBox: 'fill-box',
              transformOrigin: '0% 50%',
            }}
          />
          {/* Body */}
          <ellipse cx="0" cy="0" rx="1.3" ry="7" fill={NEON} />
          {/* Head */}
          <circle cx="0" cy="-7.5" r="1.4" fill={NEON} />
        </svg>
      </div>
    </motion.div>
  );
}
