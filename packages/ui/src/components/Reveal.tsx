'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Stagger step multiplier; delay = delayIndex * --stagger-step. */
  delayIndex?: number;
  /** Render as a different element if needed (defaults to div). */
  as?: 'div' | 'li' | 'section';
}

export function Reveal({ delayIndex = 0, as = 'div', className, style, children, ...props }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      data-shown={shown}
      className={cn(
        'transition-[opacity,transform] duration-reveal ease-standard motion-reduce:transition-none',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className,
      )}
      style={{ transitionDelay: shown ? `calc(${delayIndex} * var(--stagger-step))` : '0ms', ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
