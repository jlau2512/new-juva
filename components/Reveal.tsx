'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: keyof JSX.IntrinsicElements;
}

// Safety fallback: if for any reason GSAP/ScrollTrigger fails to fire (slow init,
// Lenis scroller-proxy race, errored import), force the element visible after
// this many ms so the page is never stranded at opacity:0.
const FOIC_FALLBACK_MS = 1500;

export default function Reveal({ children, className, delay = 0, y = 32, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ctx: any;
    let cancelled = false;
    let revealed = false;

    // Safety net — if nothing has revealed this element within the timeout,
    // force it visible. Cleared as soon as the GSAP tween actually starts.
    const fallbackId = window.setTimeout(() => {
      if (revealed || cancelled) return;
      revealed = true;
      el.style.opacity = '1';
      el.style.transform = 'none';
    }, FOIC_FALLBACK_MS);

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.fromTo(
            el,
            { opacity: 0, y, willChange: 'transform, opacity' },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
              onStart: () => {
                revealed = true;
                window.clearTimeout(fallbackId);
              },
            }
          );
        }, el);
      } catch {
        // If GSAP itself fails to load, snap visible immediately.
        if (cancelled) return;
        revealed = true;
        window.clearTimeout(fallbackId);
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackId);
      try { ctx?.revert(); } catch {}
    };
  }, [delay, y]);

  const Tag: any = as;
  return (
    <Tag ref={ref as any} className={cn(className)} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
