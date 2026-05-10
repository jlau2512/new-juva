'use client';
import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: any;
    let cleanup: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('@studio-freight/lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      lenis = new Lenis({
        lerp: reduce ? 1 : 0.1,
        duration: reduce ? 0 : 1.2,
        smoothWheel: !reduce,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      // Drive Lenis off GSAP's ticker so every scroll-linked animation stays in sync.
      const tickerCb = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      // Update ScrollTrigger every Lenis frame.
      lenis.on('scroll', ScrollTrigger.update);

      // Tell ScrollTrigger to use Lenis as the scroller proxy on the body.
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length && value !== undefined) lenis.scrollTo(value, { immediate: true });
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
      });

      ScrollTrigger.defaults({ scroller: document.body });
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(tickerCb);
        lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
