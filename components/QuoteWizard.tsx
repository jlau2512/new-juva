'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { SITE } from '@/lib/config';
import type { Dict, Locale } from '@/lib/i18n';

type StepKey = 'service' | 'scope' | 'budget' | 'timeline' | 'contact';

type FormState = {
  service: string;
  scope: string;
  budget: string;
  timeline: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  details: string;
  // honeypot
  website_url: string;
};

const initial: FormState = {
  service: '',
  scope: '',
  budget: '',
  timeline: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  details: '',
  website_url: '',
};

export default function QuoteWizard({ dict, locale }: { dict: Dict; locale: Locale }) {
  const steps = dict.quote.steps;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<'ok' | 'err' | null>(null);

  const total = steps.length;
  const progress = useMemo(() => Math.round(((step + 1) / total) * 100), [step, total]);

  const current = steps[step];
  const fieldVal = (current.field as StepKey) !== 'contact' ? (data[current.field as keyof FormState] as string) : '';

  const canContinue = useMemo(() => {
    if (current.field === 'contact') {
      return data.firstName.trim() && data.lastName.trim() && /^\S+@\S+\.\S+$/.test(data.email);
    }
    return !!fieldVal;
  }, [current, data, fieldVal]);

  const next = () => {
    if (!canContinue) return;
    if (step < total - 1) setStep(step + 1);
    else void submit();
  };
  const back = () => step > 0 && setStep(step - 1);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        service: data.service,
        scope: data.scope,
        budget: data.budget,
        timeline: data.timeline,
        details: data.details,
        source: 'quote-wizard',
        locale,
        website_url: data.website_url, // honeypot — must remain empty
      };
      const res = await fetch(SITE.formEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      // Apps Script web apps often return text/plain; treat any 2xx as ok
      if (!res.ok) throw new Error('bad');
      setDone('ok');
    } catch {
      setDone('err');
    } finally {
      setBusy(false);
    }
  };

  if (done === 'ok') {
    return (
      <div className="rounded-3xl border border-accent/30 bg-accent/[0.06] p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg">
          <Check size={28} strokeWidth={3} />
        </div>
        <h3 className="mt-6 h-display text-3xl">{dict.quote.successTitle}</h3>
        <p className="mt-3 text-ink-muted">{dict.quote.successBody}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-bg-card p-8 md:p-10">
      {/* progress */}
      <div className="mb-8 flex items-center justify-between text-xs text-ink-muted">
        <span className="font-display tracking-[0.25em]">
          {dict.quote.progress} {step + 1} {dict.quote.of} {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="mt-10 min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="h-display text-3xl md:text-4xl">{current.label}</h3>
            <p className="mt-2 text-ink-muted">{current.sub}</p>

            {current.field === 'contact' ? (
              <div className="mt-8 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={current.firstName}
                    value={data.firstName}
                    onChange={(v) => setData({ ...data, firstName: v })}
                    required
                  />
                  <Field
                    label={current.lastName}
                    value={data.lastName}
                    onChange={(v) => setData({ ...data, lastName: v })}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={current.email}
                    type="email"
                    value={data.email}
                    onChange={(v) => setData({ ...data, email: v })}
                    required
                  />
                  <Field
                    label={current.phone}
                    type="tel"
                    value={data.phone}
                    onChange={(v) => setData({ ...data, phone: v })}
                  />
                </div>
                <Field
                  label={current.details}
                  textarea
                  value={data.details}
                  onChange={(v) => setData({ ...data, details: v })}
                />
                {/* honeypot */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden
                  value={data.website_url}
                  onChange={(e) => setData({ ...data, website_url: e.target.value })}
                />
              </div>
            ) : (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {(current as any).options.map((opt: { v: string; label: string; emoji: string }) => {
                  const active = (data as any)[current.field] === opt.v;
                  return (
                    <li key={opt.v}>
                      <button
                        type="button"
                        onClick={() =>
                          setData({ ...data, [current.field]: opt.v } as FormState)
                        }
                        className={`group flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                          active
                            ? 'border-accent bg-accent/10 text-ink'
                            : 'border-white/10 bg-bg-light hover:border-white/25'
                        }`}
                      >
                        <span className="text-3xl">{opt.emoji}</span>
                        <span className="flex-1 font-display text-base">{opt.label}</span>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-bg ${
                            active ? 'border-accent bg-accent' : 'border-white/15 bg-transparent'
                          }`}
                        >
                          {active && <Check size={14} strokeWidth={3} />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {done === 'err' && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {dict.quote.errorBody}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-pill border border-white/10 px-5 py-3 text-sm text-ink-muted transition-all hover:border-white/30 hover:text-ink disabled:opacity-40"
        >
          <ArrowLeft size={14} /> {dict.quote.back}
        </button>
        <button
          onClick={next}
          disabled={!canContinue || busy}
          className="btn-primary disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" /> {dict.quote.sending}
            </>
          ) : step === total - 1 ? (
            <>
              {dict.quote.submit} <ArrowRight size={16} />
            </>
          ) : (
            <>
              {dict.quote.next} <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-muted">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-2xl border border-white/10 bg-bg px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded-pill border border-white/10 bg-bg px-5 py-3.5 text-sm outline-none transition-colors focus:border-accent"
        />
      )}
    </label>
  );
}
