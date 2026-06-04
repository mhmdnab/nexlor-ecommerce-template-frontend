import { cn } from '../lib/cn';

/**
 * Overlay surface (sticky header, sheet, dialog). Glass = "this floats over
 * dismissable content" — never decorative (per DESIGN.md blur-purpose rule).
 */
export function GlassPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border border-glass-border bg-glass-tint/80 supports-[backdrop-filter]:bg-glass-tint/65',
        'supports-[backdrop-filter]:backdrop-blur-glass',
        className,
      )}
      {...props}
    />
  );
}
