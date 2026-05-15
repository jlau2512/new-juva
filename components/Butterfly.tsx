'use client';

import { useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------------------
 * A small butterfly that flies freely around the site. Uses a real 3D-rendered
 * butterfly PNG (Microsoft Fluent Emoji, MIT-licensed) — no SVG, no procedural
 * geometry. Motion is a parametric meandering path (slow drift across the
 * viewport + figure-8 wander on top). The image rotates to face the direction
 * of travel and uses a subtle scaleX oscillation on the body axis to imply
 * wing flap. The animation runs in a single requestAnimationFrame loop that
 * writes directly to `style.transform` — zero React re-renders, zero lag.
 *
 * Skipped on prefers-reduced-motion. Pointer-events: none. Sits below the
 * header (z-30) so it slips behind the nav when it flies near the top.
 * ------------------------------------------------------------------------- */

const SIZE = 48; // px

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

      // Slow drift of the "center" across the viewport
      const cx = w * (0.5 + Math.cos(time * 0.045) * 0.32);
      const cy = h * (0.5 + Math.sin(time * 0.06) * 0.26);

      // Figure-8 / Lissajous wander on top (gives that meandering butterfly feel)
      const wx = Math.cos(time * 0.45) * 90 + Math.sin(time * 0.85) * 28;
      const wy = Math.sin(time * 0.55) * 60 + Math.cos(time * 1.05) * 20;

      const x = cx + wx;
      const y = cy + wy;

      // Face direction of travel
      const dx = x - prevX;
      const dy = y - prevY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 so image-up = forward
      prevX = x;
      prevY = y;

      // Wing flap — subtle scaleX oscillation along the body axis
      const flap = 0.72 + 0.28 * Math.abs(Math.cos(time * 6.5));

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
        filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))',
      }}
    />
  );
}
