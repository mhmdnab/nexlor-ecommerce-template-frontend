'use client';

import { useRef } from 'react';
import { cn } from '../lib/cn';

export interface MagneticButtonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Max offset in px the child drifts toward the pointer. */
  strength?: number;
}

export function MagneticButton({ strength = 6, className, children, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const enabled = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn('inline-flex transition-transform duration-base ease-spring will-change-transform', className)}
      {...props}
    >
      {children}
    </span>
  );
}
