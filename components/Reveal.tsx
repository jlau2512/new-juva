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

export default function Reveal({ children, className, delay = 0, y = 32, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

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
          { opacity: 0, y, willChange: 'transform, opacity' },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      }, el);
    })();

    return () => {
      cancelled = true;
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
