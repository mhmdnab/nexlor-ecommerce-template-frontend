'use client';

import {
  BentoGrid,
  BentoTile,
  buttonVariants,
  cn,
  Eyebrow,
  GradientText,
  MagneticButton,
  Marquee,
  Reveal,
  Section,
} from '@repo/ui';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';
import { useCategories, useProducts } from '@/lib/queries';

const VALUE_PROPS = [
  'Free shipping over $75',
  '30-day returns',
  'Carbon-neutral delivery',
  'Crafted to last',
  'Secure checkout',
  'Sustainably sourced',
];

export default function HomePage() {
  const featured = useProducts({ limit: 8, sort: 'createdAt', order: 'desc' });
  const { data: categories } = useCategories();
  const cats = (categories ?? []).slice(0, 5);

  // Subtle parallax for the hero glow blob. framer-motion is globally
  // reduced-motion-guarded via MotionConfig, so this is a no-op when the
  // user prefers reduced motion.
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 600], [0, 40]);

  return (
    <div>
      {/* ───────────────────────── 1) HERO ───────────────────────── */}
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-surface-inverse sm:rounded-2xl">
          {/* Brand-gradient glow blob (blurred, parallaxed) */}
          <motion.div
            aria-hidden
            style={{ y: glowY }}
            className="pointer-events-none absolute -right-24 -top-32 h-[36rem] w-[36rem] rounded-full bg-gradient-brand opacity-50 blur-3xl sm:opacity-60"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-brand opacity-25 blur-3xl"
          />

          <div className="relative z-10 mx-auto flex min-h-[64vh] max-w-7xl flex-col justify-center px-6 py-20 sm:px-10 lg:min-h-[70vh] lg:py-28">
            <Reveal>
              <Eyebrow className="text-surface-inverse-muted">New season · 2026</Eyebrow>
            </Reveal>
            <Reveal delayIndex={1}>
              <h1 className="font-display mt-4 max-w-3xl text-surface-inverse-foreground">
                Considered goods.
              </h1>
            </Reveal>
            <Reveal delayIndex={2}>
              <p className="mt-5 max-w-md text-lg text-surface-inverse-muted">
                Quietly premium essentials, made to last and priced to feel fair.
              </p>
            </Reveal>
            <Reveal delayIndex={3}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* PRIMARY: solid light button (dark text) — never white-on-gradient */}
                <MagneticButton>
                  <Link
                    href="/products"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-surface text-foreground shadow-sm hover:bg-surface-sunken',
                    )}
                  >
                    Shop the collection
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </MagneticButton>
                {/* SECONDARY: outline ghost on dark */}
                <Link
                  href="/products?sort=createdAt&order=desc"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'ghost' }),
                    'border border-white/30 text-white hover:bg-white/10 hover:text-white',
                  )}
                >
                  New arrivals
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ───────────────── 2) BENTO — Shop by category ───────────────── */}
        <section className="py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Browse the range</Eyebrow>
              <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                Shop by category
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-foreground hover:underline sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <BentoGrid>
            {cats.map((cat, i) => (
              <Reveal
                key={cat.id}
                delayIndex={i}
                className={cn(
                  i === 0 ? 'col-span-2 row-span-2 lg:col-span-2' : 'lg:col-span-1',
                )}
              >
                <BentoTile className="h-full min-h-[12rem] border-0 p-0">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="block h-full w-full"
                  >
                    <Image
                      src={`https://picsum.photos/seed/nx-cat-${cat.slug}/800/800`}
                      alt={cat.name}
                      fill
                      sizes={
                        i === 0
                          ? '(max-width: 1024px) 100vw, 50vw'
                          : '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw'
                      }
                      className="object-cover transition-transform duration-slow group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 sm:p-5">
                      <h3 className="font-serif text-lg font-semibold text-white sm:text-xl">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-white/80">{cat.productCount} products</p>
                    </div>
                  </Link>
                </BentoTile>
              </Reveal>
            ))}

            {/* Gradient promo tile */}
            <Reveal delayIndex={cats.length} className="col-span-2 lg:col-span-2">
              <BentoTile className="h-full min-h-[12rem] border-0 bg-gradient-brand p-0">
                <Link
                  href="/products"
                  className="flex h-full flex-col justify-between p-5 text-primary-foreground sm:p-6"
                >
                  <Eyebrow className="text-primary-foreground">Limited time</Eyebrow>
                  <div>
                    <p className="font-serif text-2xl font-semibold sm:text-3xl">
                      Up to 30% off
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary-foreground">
                      Shop the sale <ArrowRight className="h-4 w-4" aria-hidden />
                    </p>
                  </div>
                </Link>
              </BentoTile>
            </Reveal>
          </BentoGrid>
        </section>

        {/* ───────────────── 3) PRODUCT RAIL — New arrivals ───────────────── */}
        <section className="pb-16 sm:pb-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Fresh in</Eyebrow>
              <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                New <GradientText>arrivals</GradientText>
              </h2>
            </div>
            <Link
              href="/products?sort=createdAt&order=desc"
              className="hidden items-center gap-1 text-sm font-medium text-foreground hover:underline sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ProductGrid
            products={featured.data?.data}
            isLoading={featured.isLoading}
            isError={featured.isError}
            onRetry={() => featured.refetch()}
            priorityCount={4}
          />
        </section>
      </div>

      {/* ───────────────── 4) EDITORIAL band ───────────────── */}
      <Section tone="inverse" rounded>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <Eyebrow className="text-surface-inverse-muted">Our approach</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-surface-inverse-foreground sm:text-4xl">
              Built to be reused, designed to feel premium.
            </h2>
            <p className="prose-measure mt-5 text-surface-inverse-muted">
              This storefront is a rebrandable template. Swap a single token file and a few
              store settings, and it becomes your brand — without touching component code.
            </p>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'lg' }),
                'mt-7 border border-white/30 text-white hover:bg-white/10 hover:text-white',
              )}
            >
              Explore products
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
          <Reveal delayIndex={1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://picsum.photos/seed/nx-story/1000/750"
                alt="A considered, premium product still life"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ───────────────── 5) VALUE Marquee ───────────────── */}
      <div className="mt-16 border-y border-border py-5 sm:mt-20">
        <Marquee>
          {VALUE_PROPS.map((label) => (
            <span key={label} className="flex items-center">
              <span className="px-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {label}
              </span>
              <span className="text-muted-foreground/40">·</span>
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
