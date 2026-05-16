'use client';

import { useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------------------
 * A small butterfly that flies freely across the site. Real 3D-rendered PNG
 * (Microsoft Fluent Emoji, MIT-licensed), recoloured to the brand neon-green
 * via a CSS filter chain (sepia → saturate → hue-rotate → brightness — keeps
 * the original shading intact while shifting all hues to lime).
 *
 * Motion = layered multi-frequency Lissajous so the path never repeats and
 * has the darting, chaotic quality of a real butterfly (low-freq drift +
 * mid-freq wander + high-freq jitter). The image rotates to face direction
 * of travel and uses a fast scaleX oscillation for the wingbeat.
 *
 * Single requestAnimationFrame loop writes directly to style.transform —
 * zero React re-renders, zero lag. Skipped on prefers-reduced-motion.
 * ------------------------------------------------------------------------- */

const SIZE = 40; // px — a touch smaller than before
const FLAP_HZ = 11; // butterflies flap ~5–12 Hz; this is at the energetic end

export default function Butterfly() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnabled(true);

    let raf = 0;
    let start = 0;
    let prevX = window.innerWidth * 0.5;
    let prevY = window.innerHeight * 0.5;

    const tick = (t: number) => {
      if (!start) start = t;
      const time = (t - start) / 1000;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Slow center drift across the viewport
      const cx = w * (0.5 + Math.cos(time * 0.085) * 0.36);
      const cy = h * (0.5 + Math.sin(time * 0.11) * 0.3);

      // Layered multi-frequency wander — chaotic, never-repeating, dart-like
      const wx =
        Math.cos(time * 1.6) * 70 +
        Math.sin(time * 2.9) * 36 +
        Math.cos(time * 5.3) * 14 +
        Math.sin(time * 8.7) * 6; // top harmonic = quick jitter
      const wy =
        Math.sin(time * 1.85) * 52 +
        Math.cos(time * 3.4) * 28 +
        Math.sin(time * 5.9) * 12 +
        Math.cos(time * 9.3) * 5;

      const x = cx + wx;
      const y = cy + wy;

      // Face direction of travel
      const dx = x - prevX;
      const dy = y - prevY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      prevX = x;
      prevY = y;

      // Fast wing flap along the body axis
      const flap = 0.65 + 0.35 * Math.abs(Math.cos(time * FLAP_HZ * Math.PI * 0.7));

      const el = imgRef.current;
      if (el) {
        el.style.transform =
          `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0) ` +
          `rotate(${angle}deg) scaleX(${flap})`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  if (!enabled) return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={imgRef}
      src="/butterfly.png"
      alt=""
      aria-hidden
      width={SIZE}
      height={SIZE}
      draggable={false}
      className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform select-none"
      style={{
        width: SIZE,
        height: SIZE,
        transform: `translate3d(-${SIZE * 2}px, -${SIZE * 2}px, 0)`,
        // Recolour the coral/purple butterfly to brand neon-green while keeping
        // the original 3D shading. sepia(1) collapses the image to warm
        // monochrome, then hue-rotate shifts it to lime; saturate boosts the
        // chroma; brightness lifts it for that neon glow against the dark bg.
        filter:
          'sepia(1) saturate(5) hue-rotate(40deg) brightness(1.08) ' +
          'drop-shadow(0 6px 10px rgba(200, 255, 61, 0.25))',
      }}
    />
  );
}
