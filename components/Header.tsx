'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { type Locale, alt as altLocale, type Dict } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function Header({ locale, dict }: { locale: Locale; dict: Dict }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = [
    { href: `/${locale}/work`, label: dict.nav.work },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/process`, label: dict.nav.process },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const altLoc = altLocale(locale);
  const stripped = pathname.replace(/^\/(en|fr)/, '') || '/';
  const switchHref = `/${altLoc}${stripped === '/' ? '' : stripped}`;

  return (
    <header className={cn(
      'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
      scrolled ? 'border-b border-white/[0.07] bg-bg/80 backdrop-blur-xl' : 'bg-transparent'
    )}>
      <div className="container-x flex h-[68px] items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="group flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-[0.15em] text-shimmer">JUVA</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-500 group-hover:scale-150" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="group relative font-label text-[13px] font-medium text-ink-muted transition-colors hover:text-ink">
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href={switchHref}
            className="rounded-pill border border-white/10 px-3 py-1.5 font-label text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-all hover:border-accent/40 hover:text-accent">
            {altLoc.toUpperCase()}
          </Link>
          <Link href={`/${locale}/contact`} className="btn-primary !px-5 !py-2.5 !text-[13px]">
            {dict.nav.cta}
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.07] bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-5">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className="rounded-2xl px-4 py-3.5 font-label text-[15px] text-ink-muted hover:bg-white/[0.04] hover:text-ink transition-colors">
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex gap-3">
                <Link href={switchHref}
                  className="rounded-pill border border-white/10 px-4 py-2.5 font-label text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                  {altLoc.toUpperCase()}
                </Link>
                <Link href={`/${locale}/contact`} className="btn-primary flex-1 !py-2.5 text-center">
                  {dict.nav.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
