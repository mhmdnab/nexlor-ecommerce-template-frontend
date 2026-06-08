'use client';

import { buttonVariants, cn, Eyebrow } from '@repo/ui';

export function NewsletterBand() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-brand px-6 py-16 text-center sm:px-10">
        <div className="relative z-10 mx-auto max-w-xl">
          <Eyebrow className="text-primary-foreground/80">Stay in the loop</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary-foreground sm:text-4xl">
            First access to new arrivals
          </h2>
          <p className="mt-3 text-primary-foreground/85">
            Join the list for early drops, restocks, and the occasional members-only offer.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-full bg-surface px-5 text-sm text-foreground shadow-sm outline-none placeholder:text-subtle-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-foreground text-background hover:opacity-90',
              )}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
