'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/cn';

/** Accessible quantity stepper with min/max bounds. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  className,
  size = 'md',
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div
      className={cn('inline-flex items-center rounded-md border border-border-strong bg-surface', className)}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={cn(
          btn,
          'grid place-items-center rounded-l-md text-foreground transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:hover:bg-transparent',
        )}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className="tabular h-full w-10 border-x border-border bg-transparent text-center text-sm font-medium outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={cn(
          btn,
          'grid place-items-center rounded-r-md text-foreground transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:hover:bg-transparent',
        )}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
