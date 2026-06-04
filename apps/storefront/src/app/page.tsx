'use client';

import { buttonVariants } from '@repo/ui';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';
import { useCategories, useProducts } from '@/lib/queries';

export default function HomePage() {
  const featured = useProducts({ limit: 8, sort: 'createdAt', order: 'desc' });
  const { data: categories } = useCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/nexlor-hero/1920/1080"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">New season</p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl font-semibold leading-[1.05] text-white sm:text-6xl">
            Considered goods for everyday life.
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/85">
            Quietly premium essentials, made to last and priced to feel fair.
          </p>
          <div className="mt-8">
            <Link href="/products" className={buttonVariants({ size: 'lg' })}>
              Shop the collection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category tiles */}
        <section className="py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(categories ?? []).slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-surface-sunken"
              >
                <Image
                  src={`https://picsum.photos/seed/cat-${cat.slug}/800/540`}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-slow group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-serif text-xl font-semibold text-white">{cat.name}</h3>
                  <p className="text-sm text-white/80">{cat.productCount} products</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="pb-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold">New arrivals</h2>
              <p className="mt-1 text-muted-foreground">Fresh in this season.</p>
            </div>
            <Link
              href="/products"
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

        {/* Editorial band */}
        <section className="my-20 grid items-center gap-8 rounded-xl border border-border bg-surface p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Built to be reused, designed to feel premium.</h2>
            <p className="mt-4 text-muted-foreground prose-measure">
              This storefront is a rebrandable template. Swap a single token file and a few store settings,
              and it becomes your brand — without touching component code.
            </p>
            <Link href="/products" className={buttonVariants({ variant: 'secondary', className: 'mt-6' })}>
              Explore products
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src="https://picsum.photos/seed/nexlor-story/1000/750" alt="" fill className="object-cover" />
          </div>
        </section>
      </div>
    </div>
  );
}
