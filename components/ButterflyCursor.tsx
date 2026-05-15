'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/* ---------------------------------------------------------------------------
 * Site-wide neon butterfly cursor companion. Real 3D mesh via React Three
 * Fiber (procedural wing geometry, layered additive-blend glow, animated
 * flap, antennae tubes, body capsule). The Three.js bundle is lazy-loaded
 * (ssr:false) and only mounted on capable, hover-capable, non-reduced-motion
 * devices — touch and a11y-sensitive users get nothing rendered.
 * ------------------------------------------------------------------------- */

const Inner = dynamic(() => import('./ButterflyCursorInner'), {
  ssr: false,
  loading: () => null,
});

export default function ButterflyCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // WebGL gate
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
    } catch {
      return;
    }
    setEnabled(true);
  }, []);

  if (!enabled) return null;
  return <Inner />;
}
