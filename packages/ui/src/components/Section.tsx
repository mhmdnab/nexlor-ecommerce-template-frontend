import { cn } from '../lib/cn';

type Tone = 'default' | 'inverse' | 'gradient';

const toneClasses: Record<Tone, string> = {
  default: 'bg-background text-foreground',
  inverse: 'bg-surface-inverse text-surface-inverse-foreground',
  gradient: 'bg-gradient-brand text-primary-foreground',
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual tone. `inverse`/`gradient` are the dark "drama" bands. */
  tone?: Tone;
  /** Wrap children in the standard max-width container with horizontal gutters. */
  container?: boolean;
  /** Round the section into a card-like band (used for inverse/gradient bands). */
  rounded?: boolean;
}

export function Section({
  tone = 'default',
  container = true,
  rounded = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        'py-16 sm:py-20',
        toneClasses[tone],
        rounded && 'mx-4 overflow-hidden rounded-2xl sm:mx-6 lg:mx-8',
        className,
      )}
      {...props}
    >
      {container ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
