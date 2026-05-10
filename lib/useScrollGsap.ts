'use client';
import { useEffect } from 'react';

export function useGsap(setup: (gsap: any, ScrollTrigger: any, ctx: HTMLElement | null) => void | (() => void), deps: React.DependencyList = []) {
  useEffect(() => {
    let cleanup: void | (() => void);
    let cancelled = false;
    let scope: any;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      scope = gsap.context(() => {
        cleanup = setup(gsap, ScrollTrigger, null);
      });
    })();

    return () => {
      cancelled = true;
      try { cleanup?.(); } catch {}
      try { scope?.revert(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
