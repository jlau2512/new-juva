import type { Dict } from '@/lib/i18n';

export default function Marquee({ dict }: { dict: Dict }) {
  const items = dict.marquee;
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.07] py-5 bg-bg-surface/50">
      <div className="mask-fade-x flex">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {repeated.map((item, k) => (
            <span key={k} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-label text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-muted">{item}</span>
              <span className="h-1 w-1 rounded-full bg-accent/40 flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
