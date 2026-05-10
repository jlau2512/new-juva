'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import type { Dict, Locale } from '@/lib/i18n';

const CARD_COLORS = [
  'from-[#1a2412] to-[#0d1309]',
  'from-[#1a1412] to-[#0d0d09]',
  'from-[#121a1a] to-[#090d0d]',
  'from-[#1a1218] to-[#0d090d]',
  'from-[#181a12] to-[#0d0e09]',
  'from-[#121814] to-[#080d0a]',
];

type WorkItem = { readonly tag: string; readonly title: string; readonly desc: string; readonly url: string };

function WorkCard({ item, idx }: { item: WorkItem; idx: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label={`${item.title} — ${item.tag}. Opens in new tab.`}
      className="js-work-card group relative block overflow-hidden rounded-3xl aspect-[4/3]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${CARD_COLORS[idx % CARD_COLORS.length]}`} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Tag */}
      <div className="absolute top-5 left-5 z-10">
        <span className="font-label text-[10px] uppercase tracking-[0.25em] text-accent/80 border border-accent/20 bg-accent/[0.06] rounded-pill px-3 py-1">
          {item.tag}
        </span>
      </div>

      {/* External link indicator */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.5, scale: hovered ? 1 : 0.92 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-5 right-5 z-10 pointer-events-none"
        aria-hidden
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 border border-accent/30 text-accent">
          <ArrowUpRight size={16} />
        </span>
      </motion.div>

      {/* Hover overlay with title + desc */}
      <motion.div
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-10 flex flex-col justify-end p-7 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none"
      >
        <h3 className="font-display text-3xl font-medium text-ink">{item.title}</h3>
        <p className="mt-2 text-sm text-ink-muted max-w-[280px]">{item.desc}</p>
      </motion.div>

      {/* Always-visible title (fades on hover) */}
      <motion.div
        animate={{ opacity: hovered ? 0 : 1, y: hovered ? -8 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-5 left-5 z-10 pointer-events-none"
      >
        <h3 className="font-display text-2xl font-medium text-ink/90">{item.title}</h3>
      </motion.div>
    </motion.a>
  );
}

export default function Work({ locale: _locale, dict }: { locale: Locale; dict: Dict }) {
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
        ScrollTrigger.batch('.js-work-card', {
          start: 'top 85%',
          onEnter: (els) => gsap.fromTo(els,
            { y: 60, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: 'auto' }),
        });
        // Subtle parallax — single ScrollTrigger per card
        gsap.utils.toArray<HTMLElement>('.js-work-card').forEach((card, i) => {
          gsap.to(card, {
            y: i % 2 === 0 ? -40 : -60, ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      }, rootRef);
    })();
    return () => { cancelled = true; try { ctx?.revert(); } catch {} };
  }, []);

  return (
    <section ref={rootRef} id="work" className="relative py-28 md:py-36">
      <div className="container-x">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="section-label">{dict.work.label}</span>
            <h2 className="mt-4 font-display text-[clamp(36px,5.5vw,68px)] text-ink">
              {dict.work.title}{' '}
              <em className="not-italic italic text-accent">{dict.work.titleStrong}</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-ink-muted">{dict.work.sub}</p>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {dict.work.items.map((item, k) => <WorkCard key={k} item={item as WorkItem} idx={k} />)}
        </div>
      </div>
    </section>
  );
}
