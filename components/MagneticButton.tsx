'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  strength?: number;
};

export default function MagneticButton({
  href,
  onClick,
  children,
  className,
  type = 'button',
  ariaLabel,
  strength = 22,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * strength;
    x.set(dx);
    y.set(dy);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const inner = (
    <motion.span
      className={cn('inline-flex', className)}
      style={{ x: sx, y: sy }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block">
        <Link href={href} aria-label={ariaLabel}>
          {inner}
        </Link>
      </div>
    );
  }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block">
      <button type={type} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </button>
    </div>
  );
}
