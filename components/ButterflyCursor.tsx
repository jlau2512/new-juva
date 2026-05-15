'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ---------------------------------------------------------------------------
 * A Monarch-style detailed SVG butterfly that follows the cursor with real
 * flying motion. Each wing-half is its own HTML element inside a CSS
 * perspective context — wings flap via `rotateY` anchored at the body axis,
 * forewings + hindwings move together. The body, head and antennae sit on
 * top of the wings and don't flap. The whole thing chases the cursor via
 * spring physics with a figure-8 wander, banks into the direction of travel,
 * and bobs vertically in sync with the wingbeat (like a real one).
 *
 * Hidden on touch / no-hover / reduced-motion devices. Pointer-events: none.
 * ------------------------------------------------------------------------- */

// Palette — Monarch butterfly
const ORANGE_LIGHT = '#FFB13C';
const ORANGE_MID = '#E07820';
const ORANGE_DEEP = '#A85010';
const BLACK = '#1a0d05';
const VEIN = '#5a2a10';
const SPOT = '#FFFCF2';

function HalfButterfly({ id }: { id: string }) {
  // One side (oriented as the LEFT half — wings extend in -X).
  // We mirror via CSS for the right side.
  return (
    <svg
      viewBox="-260 -210 285 425"
      width="84"
      height="125"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`f-${id}`} x1="0" y1="-200" x2="-235" y2="-30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ORANGE_LIGHT} />
          <stop offset="0.55" stopColor={ORANGE_MID} />
          <stop offset="1" stopColor={ORANGE_DEEP} />
        </linearGradient>
        <linearGradient id={`h-${id}`} x1="0" y1="0" x2="-180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ORANGE_MID} />
          <stop offset="0.6" stopColor={ORANGE_MID} />
          <stop offset="1" stopColor={ORANGE_DEEP} />
        </linearGradient>
      </defs>

      {/* HINDWING — drawn first so it sits under the forewing */}
      {/* Black silhouette (slightly larger = creates the thick black border) */}
      <path
        d="M 0 -10 C -55 50, -160 105, -185 175 C -175 215, -110 215, -45 195 C -10 180, 0 145, 0 75 Z"
        fill={BLACK}
      />
      {/* Orange interior */}
      <path
        d="M -2 0 C -50 50, -145 100, -165 165 C -158 195, -100 195, -45 178 C -15 165, -8 135, -6 72 Z"
        fill={`url(#h-${id})`}
      />
      {/* Veins */}
      <path d="M -4 30 Q -70 70 -150 145" stroke={VEIN} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M -4 40 Q -55 95 -100 175" stroke={VEIN} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M -4 50 Q -30 110 -50 185" stroke={VEIN} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M -4 60 Q -10 120 -10 175" stroke={VEIN} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* White spots along outer black border */}
      <circle cx="-155" cy="170" r="3.5" fill={SPOT} />
      <circle cx="-130" cy="190" r="3.2" fill={SPOT} />
      <circle cx="-95" cy="200" r="3.5" fill={SPOT} />
      <circle cx="-60" cy="200" r="3.2" fill={SPOT} />
      <circle cx="-175" cy="140" r="3" fill={SPOT} />

      {/* FOREWING */}
      {/* Black silhouette */}
      <path
        d="M 0 -130 C -95 -195, -200 -210, -245 -160 C -260 -110, -240 -65, -180 -42 C -110 -28, -45 -45, 0 -68 Z"
        fill={BLACK}
      />
      {/* Orange interior */}
      <path
        d="M -2 -135 C -90 -180, -190 -190, -222 -148 C -235 -110, -218 -75, -170 -55 C -110 -42, -52 -55, -6 -75 Z"
        fill={`url(#f-${id})`}
      />
      {/* Veins */}
      <path d="M -6 -110 Q -110 -135 -210 -150" stroke={VEIN} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M -6 -100 Q -90 -115 -195 -110" stroke={VEIN} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M -6 -90 Q -70 -95 -170 -80" stroke={VEIN} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M -6 -80 Q -50 -75 -130 -60" stroke={VEIN} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M -6 -70 Q -30 -60 -70 -55" stroke={VEIN} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* White spots — Monarch has a row near the wing tip */}
      <circle cx="-215" cy="-155" r="4" fill={SPOT} />
      <circle cx="-195" cy="-180" r="3.5" fill={SPOT} />
      <circle cx="-165" cy="-195" r="3.5" fill={SPOT} />
      <circle cx="-135" cy="-200" r="3.2" fill={SPOT} />
      <circle cx="-225" cy="-130" r="3.2" fill={SPOT} />
      <circle cx="-238" cy="-100" r="2.8" fill={SPOT} />
      {/* Small bright highlight near top of forewing */}
      <ellipse cx="-130" cy="-150" rx="14" ry="6" fill={ORANGE_LIGHT} opacity="0.45" />
    </svg>
  );
}

function BodyAndAntennae() {
  return (
    <svg
      viewBox="-22 -75 44 215"
      width="32"
      height="156"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="body-grad" x1="0" y1="-40" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#221008" />
          <stop offset="0.5" stopColor="#2a1308" />
          <stop offset="1" stopColor="#1a0a04" />
        </linearGradient>
      </defs>
      {/* Body */}
      <ellipse cx="0" cy="35" rx="7" ry="65" fill="url(#body-grad)" />
      {/* Subtle body stripes (Monarch has rows of dots along the abdomen) */}
      <circle cx="0" cy="-15" r="2.2" fill={SPOT} opacity="0.85" />
      <circle cx="0" cy="5" r="2.2" fill={SPOT} opacity="0.85" />
      <circle cx="0" cy="25" r="2.2" fill={SPOT} opacity="0.85" />
      <circle cx="0" cy="45" r="2.2" fill={SPOT} opacity="0.85" />
      <circle cx="0" cy="65" r="2" fill={SPOT} opacity="0.85" />
      <circle cx="0" cy="85" r="1.8" fill={SPOT} opacity="0.85" />
      <circle cx="0" cy="105" r="1.5" fill={SPOT} opacity="0.85" />
      {/* Head */}
      <circle cx="0" cy="-50" r="11" fill={BLACK} />
      {/* Eye highlights */}
      <circle cx="-5" cy="-52" r="2.2" fill="#3a1f10" />
      <circle cx="5" cy="-52" r="2.2" fill="#3a1f10" />
      {/* Antennae */}
      <path
        d="M -7 -57 Q -16 -68 -20 -72"
        stroke={BLACK}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 7 -57 Q 16 -68 20 -72"
        stroke={BLACK}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Antennae club tips */}
      <circle cx="-20" cy="-72" r="3.2" fill={BLACK} />
      <circle cx="20" cy="-72" r="3.2" fill={BLACK} />
    </svg>
  );
}

export default function ButterflyCursor() {
  // Cursor motion values (raw px, top-left origin)
  const cursorX = useMotionValue(-300);
  const cursorY = useMotionValue(-300);
  // Smoothed follow — soft floaty chase
  const followX = useSpring(cursorX, { stiffness: 65, damping: 22, mass: 0.85 });
  const followY = useSpring(cursorY, { stiffness: 65, damping: 22, mass: 0.85 });
  // Wander overlays (figure-8 in screen space) — applied directly, not springed
  const wanderX = useMotionValue(0);
  const wanderY = useMotionValue(0);
  // Final position
  const x = useTransform([followX, wanderX], (v) => (v[0] as number) + (v[1] as number));
  const y = useTransform([followY, wanderY], (v) => (v[0] as number) + (v[1] as number));
  // Wing flap normalised 0..1
  const flap = useMotionValue(0);
  // Wings rotate ~ -10 .. +95° (CSS rotateY) — a touch past 90 for the "wings touch" moment
  const flapAngle = useTransform(flap, (v) => -10 + v * 105);
  const flapAngleR = useTransform(flapAngle, (v) => -v);
  // Body banks toward direction of travel
  const bank = useMotionValue(0);

  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prevPosRef = useRef({ x: 0, y: 0 });

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
      // Figure-8 wander — real butterflies don't fly in straight lines
      wanderX.set(Math.cos(time * 1.0) * 16 + Math.sin(time * 0.6) * 6);
      wanderY.set(Math.sin(time * 0.85) * 12 - Math.cos(time * 1.4) * 4);
      // Smooth cosine flap, ~9.5 beats per second (Monarchs do ~5–12 Hz)
      flap.set((Math.cos(time * 9.5) + 1) / 2);
      // Bank: tilt the whole butterfly based on horizontal velocity
      const curX = followX.get() + wanderX.get();
      const curY = followY.get() + wanderY.get();
      const vx = curX - prevPosRef.current.x;
      prevPosRef.current = { x: curX, y: curY };
      const target = -vx * 1.2; // tilt
      bank.set(bank.get() + (target - bank.get()) * 0.12);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [cursorX, cursorY, followX, followY, wanderX, wanderY, flap, bank]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[55] will-change-transform"
      style={{ x, y }}
    >
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2"
        style={{ rotate: bank, filter: `drop-shadow(0 8px 14px rgba(0,0,0,0.45))` }}
      >
        <div style={{ perspective: '700px' }}>
          <div
            className="relative"
            style={{
              width: 180,
              height: 156,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Left wings — origin at body axis, flaps via rotateY */}
            <motion.div
              className="absolute"
              style={{
                left: 6,
                top: 14,
                width: 84,
                height: 125,
                transformOrigin: '100% 50%',
                transformStyle: 'preserve-3d',
                rotateY: flapAngle,
              }}
            >
              <HalfButterfly id="l" />
            </motion.div>

            {/* Right wings — same artwork mirrored via scaleX(-1), flips rotation sign */}
            <motion.div
              className="absolute"
              style={{
                right: 6,
                top: 14,
                width: 84,
                height: 125,
                transformOrigin: '0% 50%',
                transformStyle: 'preserve-3d',
                rotateY: flapAngleR,
                scaleX: -1,
              }}
            >
              <HalfButterfly id="r" />
            </motion.div>

            {/* Body + head + antennae — centered, drawn on top */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                width: 32,
                zIndex: 2,
              }}
            >
              <BodyAndAntennae />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
