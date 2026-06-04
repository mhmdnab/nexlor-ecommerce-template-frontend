'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../lib/cn';

export interface MagneticButtonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Max offset in px the child drifts toward the pointer. */
  strength?: number;
}

/**
 * Wraps a child (Link/Button) and nudges it toward the pointer on hover.
 * Tracks the pointer instantly while moving; the spring transition only plays
 * on the snap-back (pointer leave). No-op on coarse pointers and reduced-motion.
 */
export function MagneticButton({ strength = 6, className, children, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      enabledRef.current = fine.matches && !reduce.matches;
    };
    update();
    fine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || !enabledRef.current) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * strength;
    el.style.transition = 'none'; // track the pointer instantly while moving
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = ''; // restore the CSS spring transition for the snap-back
    el.style.transform = '';
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
