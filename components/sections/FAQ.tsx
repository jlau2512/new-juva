'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '@/components/Reveal';
import type { Dict } from '@/lib/i18n';

type FaqItem = { readonly q: string; readonly a: string };

function Item({ item, idx, open, toggle }: {
  item: FaqItem; idx: number; open: boolean; toggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.08]">
      <button
        onClick={toggle}
        className="group flex w-full items-start gap-5 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-label text-[11px] font-semibold tracking-[0.25em] text-accent/60 mt-1 flex-shrink-0 w-7">
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-display text-xl md:text-2xl font-medium text-ink transition-colors group-hover:text-accent/90">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1 flex-shrink-0 text-accent text-2xl leading-none"
          aria-hidden
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pl-12 pr-8 text-[15px] leading-relaxed text-ink-muted">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative py-28 md:py-36">
      <div className="container-x">
        <Reveal>
          <span className="section-label">{dict.faq.label}</span>
          <h2 className="mt-4 font-display text-[clamp(36px,5.5vw,68px)] text-ink">
            {dict.faq.title}{' '}
            <em className="not-italic italic text-accent">{dict.faq.titleStrong}</em>
          </h2>
        </Reveal>
        <div className="mt-14 max-w-3xl">
          {dict.faq.items.map((item, k) => (
            <Item key={k} item={item} idx={k} open={open === k} toggle={() => setOpen(open === k ? null : k)} />
          ))}
        </div>
      </div>
    </section>
  );
}
