import { Eyebrow, Section, buttonVariants, cn } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * 404 — "Modern Immersive" treatment.
 *
 * Contrast notes:
 *  - Section tone="inverse" gives the dark band (--surface-inverse background).
 *  - The primary CTA uses the solid light button style (bg-surface + text-foreground),
 *    matching the hero CTA pattern in page.tsx — NOT white-on-gradient.
 *  - Reduced-motion: Reveal is not used here (server component); the single
 *    CSS transition on the link is suppressed by the global prefers-reduced-motion
 *    rule in theme.css.
 */
export default function NotFound() {
  return (
    <Section tone="inverse" rounded aria-labelledby="not-found-heading">
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-8 text-center">
        {/* Eyebrow — uses surface-inverse-muted token, no hex */}
        <Eyebrow className="text-surface-inverse-muted">404</Eyebrow>

        {/* Large serif display number — visual anchor */}
        <p
          className="mt-4 font-serif text-[clamp(5rem,14vw,9rem)] font-semibold leading-none text-surface-inverse-foreground"
          aria-hidden
        >
          404
        </p>

        <h1
          id="not-found-heading"
          className="mt-4 font-serif text-3xl font-semibold text-surface-inverse-foreground sm:text-4xl"
        >
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-base text-surface-inverse-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>

        {/*
          Solid light button on the dark band — bg-surface + text-foreground.
          Contrast ratio well above 4.5:1 against --surface-inverse.
          The gradient button variant (white text on gradient) is NOT used here
          because the background is already dark.
        */}
        <Link
          href="/"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'mt-10 bg-surface text-foreground shadow-sm hover:bg-surface-sunken',
          )}
          aria-label="Go back to the home page"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </Section>
  );
}
