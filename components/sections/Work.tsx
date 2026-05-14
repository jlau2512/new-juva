'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import type { Dict, Locale } from '@/lib/i18n';

type WorkItem = {
  readonly tag: string;
  readonly title: string;
  readonly desc: string;
  readonly url: string;
  readonly image: string;
};

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
      className="js-work-card group relative block overflow-hidden rounded-3xl aspect-[4/3] bg-bg-card"
    >
      {/* Screenshot background */}
      <Image
        src={item.image}
        alt={`${item.title} website screenshot`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        priority={idx < 3}
      />

      {/* Subtle desaturate filter at rest */}
      <div className="absolute inset-0 bg-bg/30 transition-colors duration-500 group-hover:bg-bg/0" />

      {/* Bottom gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Tag */}
      <div className="absolute top-5 left-5 z-10">
        <span className="font-label text-[10px] uppercase tracking-[0.25em] text-accent border border-accent/40 bg-bg/60 backdrop-blur-sm rounded-pill px-3 py-1">
          {item.tag}
        </span>
      </div>

      {/* External link indicator */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.6, scale: hovered ? 1 : 0.92 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-5 right-5 z-10 pointer-events-none"
        aria-hidden
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg/70 backdrop-blur-sm border border-accent/40 text-accent">
          <ArrowUpRight size={16} />
        </span>
      </motion.div>

      {/* Always-visible title + tag, smoothly translates up on hover */}
      <motion.div
        animate={{ y: hovered ? -56 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-5 left-5 right-5 z-10 pointer-events-none"
      >
        <h3 className="font-display text-2xl md:text-[26px] font-medium text-ink leading-tight">{item.title}</h3>
      </motion.div>

      {/* Description (slides in from below on hover) */}
      <motion.p
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 16 }}
        transition={{ duration: 0.4, delay: hovered ? 0.05 : 0, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-5 left-5 right-12 z-10 text-sm text-ink-muted pointer-events-none"
      >
        {item.desc}
      </motion.p>
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
