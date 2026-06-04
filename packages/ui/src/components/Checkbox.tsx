'use client';

import { Check } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, disabled, id, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors duration-fast outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong bg-surface',
        className,
      )}
      {...rest}
    >
      {checked && <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={3} />}
    </button>
  ),
);
Checkbox.displayName = 'Checkbox';
