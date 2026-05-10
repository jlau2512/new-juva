'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { SITE } from '@/lib/config';
import type { Dict } from '@/lib/i18n';

const KEY = 'juva.exit.dismissed';

export default function ExitIntent({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(KEY)) return;
    let armed = false;
    const armTimer = setTimeout(() => {
      armed = true;
    }, 8000); // arm only after 8s on page

    const onMouseLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= 0) {
        setOpen(true);
        sessionStorage.setItem(KEY, '1');
        document.removeEventListener('mouseleave', onMouseLeave);
      }
    };
    document.addEventListener('mouseleave', onMouseLeave);

    // mobile: trigger on visibility hide once after 25s
    const mobileTimer = setTimeout(() => {
      const onHide = () => {
        if (sessionStorage.getItem(KEY)) return;
        setOpen(true);
        sessionStorage.setItem(KEY, '1');
        document.removeEventListener('visibilitychange', onHide);
      };
      document.addEventListener('visibilitychange', onHide);
    }, 25000);

    return () => {
      clearTimeout(armTimer);
      clearTimeout(mobileTimer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await fetch(SITE.formEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          firstName: '',
          lastName: '',
          email,
          phone: '',
          service: 'audit',
          budget: '',
          details: 'Exit-intent: free audit request',
          source: 'exit-intent',
        }),
      }).catch(() => {});
    } finally {
      setBusy(false);
      setSent(true);
      setTimeout(() => setOpen(false), 2200);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-bg-light p-8 md:rounded-3xl"
          >
            <div className="blob absolute -right-20 -top-20 h-64 w-64" />
            <button
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>

            <div className="pill"><Sparkles size={12} /> {dict.exitIntent.eyebrow}</div>
            <h3 className="mt-4 h-display text-3xl md:text-4xl">{dict.exitIntent.title}</h3>
            <p className="mt-3 text-ink-muted">{dict.exitIntent.body}</p>

            {sent ? (
              <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-center text-accent">
                ✓ {dict.exitIntent.sent}
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.exitIntent.placeholder}
                  className="flex-1 rounded-pill border border-white/10 bg-bg px-5 py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-accent"
                />
                <button type="submit" disabled={busy} className="btn-primary !px-6 !py-3.5 disabled:opacity-60">
                  {busy ? '…' : dict.exitIntent.cta}
                </button>
              </form>
            )}
            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-xs text-ink-subtle underline-offset-4 hover:underline"
            >
              {dict.exitIntent.decline}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
