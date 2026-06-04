'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

type Theme = 'light' | 'dark' | 'system';

/**
 * Theme toggle backed by a `.dark` class on <html> and localStorage. Pair with
 * the inline no-flash script (see ui/src/theme-script.ts) in each app's <head>.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme((localStorage.getItem('theme') as Theme) ?? 'system');
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    localStorage.setItem('theme', next);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = next === 'dark' || (next === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
  }

  const options: { value: Theme; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn('inline-flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5', className)}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => apply(value)}
          className={cn(
            'grid h-7 w-7 place-items-center rounded transition-colors',
            theme === value ? 'bg-surface-sunken text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
