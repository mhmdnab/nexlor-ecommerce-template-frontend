'use client';

import { cn } from '../lib/cn';

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Marquee({ className, children, ...props }: MarqueeProps) {
  return (
    <div className={cn('group flex overflow-hidden', className)} {...props}>
      <div className="flex shrink-0 animate-marquee items-center motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 animate-marquee items-center motion-reduce:animate-none group-hover:[animation-play-state:paused]"
      >
        {children}
      </div>
    </div>
  );
}
