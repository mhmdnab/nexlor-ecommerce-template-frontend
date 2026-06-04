import { cn } from '../lib/cn';

/** Display text filled with the brand gradient. Falls back to currentColor. */
export function GradientText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'bg-gradient-brand bg-clip-text text-transparent',
        '[@supports(not(background-clip:text))]:text-primary',
        className,
      )}
      {...props}
    />
  );
}

/** Small uppercase label above headings. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
