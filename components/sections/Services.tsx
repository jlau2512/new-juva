'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Reveal from '@/components/Reveal';
import type { Dict } from '@/lib/i18n';

const ICONS = [
  <svg key="web" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-7 h-7 text-accent"><rect x="2" y="3" width="20" height="16" rx="2" /><path d="M8 3v16M2 8h20" /></svg>,
  <svg key="app" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-7 h-7 text-accent"><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M9 7h6M9 12h6M9 17h3" /></svg>,
  <svg key="brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-7 h-7 text-accent"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
];

type ServiceItem = { readonly kicker: string; readonly title: string; readonly body: string; readonly bullets: readonly string[] };

function ServiceCard({ s, idx }: { s: ServiceItem; idx: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sx = useSpring(rotY, { stiffness: 250, damping: 22, mass: 0.4 });
  const sy = useSpring(rotX, { stiffness: 250, damping: 22, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    rotY.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rotX.set(((e.clientY - r.top) / r.height - 0.5) * -8);
  };
  const onLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <div className="js-service-card" style={{ perspective: '1200px' }}>
      <motion.article
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: sy, rotateY: sx, transformStyle: 'preserve-3d' }}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-card p-8 transition-colors duration-500 hover:border-accent/30"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative">
          <div className="mb-5">{ICONS[idx]}</div>
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/70">{s.kicker}</div>
          <h3 className="mt-2 font-display text-3xl font-medium text-ink">{s.title}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
          <ul className="mt-6 space-y-2.5">
            {s.bullets.map((b, j) => (
              <li key={j} className="flex items-center gap-2.5 text-sm text-ink-muted">
                <span className="h-1 w-1 rounded-full bg-accent/70 flex-shrink-0" />{b}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto pt-8">
          <span className="font-label inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink-subtle transition-colors duration-300 group-hover:text-accent">
            Explore <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </motion.article>
    </div>
  );
}

export default function Services({ dict }: { dict: Dict }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: any; let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        ScrollTrigger.batch('.js-service-card', {
          start: 'top 85%',
          onEnter: (els) => gsap.fromTo(els, { y: 80, opacity: 0, rotateX: 14 },
            { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: 'auto' }),
        });
      }, rootRef);
    })();
    return () => { cancelled = true; try { ctx?.revert(); } catch {} };
  }, []);

  return (
    <section ref={rootRef} id="services" className="relative py-28 md:py-36">
      <div className="container-x relative">
        <Reveal>
          <span className="section-label">{dict.services.label}</span>
          <h2 className="mt-4 font-display text-[clamp(34px,5vw,62px)] tracking-[-0.025em] text-ink">
            {dict.services.title}{' '}
            <span className="italic text-accent">{dict.services.titleStrong}</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {dict.services.items.map((s, k) => <ServiceCard key={k} s={s as ServiceItem} idx={k} />)}
        </div>
      </div>
    </section>
  );
}
