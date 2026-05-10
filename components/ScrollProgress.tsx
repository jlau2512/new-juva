'use client';
import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ctx: any;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
          }
        );
      });
    })();

    return () => {
      cancelled = true;
      try { ctx?.revert(); } catch {}
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden />;
}
