import Link from 'next/link';
import { type Locale, type Dict } from '@/lib/i18n';
import { SITE } from '@/lib/config';

export default function Footer({ locale, dict }: { locale: Locale; dict: Dict }) {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/[0.07] bg-bg-surface">
      <div className="container-x py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-display text-4xl font-medium tracking-[0.2em] text-shimmer">JUVA</div>
            <p className="mt-4 max-w-md text-ink-muted">{dict.footer.tagline}</p>
            <p className="mt-6 text-sm text-ink-subtle">{dict.footer.crafted}</p>
          </div>
          <div className="md:col-span-3">
            <h4 className="font-label text-xs uppercase tracking-[0.25em] text-ink-subtle">{dict.footer.nav}</h4>
            <ul className="mt-5 space-y-2.5 font-label text-sm text-ink-muted">
              <li><Link className="transition-colors hover:text-accent" href={`/${locale}/work`}>{dict.nav.work}</Link></li>
              <li><Link className="transition-colors hover:text-accent" href={`/${locale}/services`}>{dict.nav.services}</Link></li>
              <li><Link className="transition-colors hover:text-accent" href={`/${locale}#process`}>{dict.nav.process}</Link></li>
              <li><Link className="transition-colors hover:text-accent" href={`/${locale}/contact`}>{dict.nav.contact}</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="font-label text-xs uppercase tracking-[0.25em] text-ink-subtle">{dict.footer.contact}</h4>
            <ul className="mt-5 space-y-2.5 font-label text-sm text-ink-muted">
              <li><a className="transition-colors hover:text-accent" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><a className="transition-colors hover:text-accent" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a></li>
              <li className="text-ink-subtle">{SITE.city}, {SITE.country}</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-8 font-label text-xs text-ink-subtle md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} {SITE.name}. {dict.footer.rights}</span>
          <span>{SITE.founded} → {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
