'use client';

import { Select, buttonVariants, cn } from '@repo/ui';
import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { Pagination } from '@repo/ui';
import { useCategories, useProducts } from '@/lib/queries';

const SORTS = [
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'basePrice:asc', label: 'Price: Low to High' },
  { value: 'basePrice:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A–Z' },
];

function ProductsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [mobileFilters, setMobileFilters] = useState(false);

  const category = params.get('category') ?? undefined;
  const q = params.get('q') ?? undefined;
  const sortParam = params.get('sort') ?? 'createdAt';
  const orderParam = (params.get('order') as 'asc' | 'desc') ?? 'desc';
  const page = parseInt(params.get('page') ?? '1', 10);

  const { data: categories } = useCategories();
  const productsQuery = useProducts({ category, q, sort: sortParam, order: orderParam, page, limit: 12 });

  function setParam(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in updates)) next.set('page', '1');
    router.push(`/products?${next.toString()}`);
  }

  const activeCategory = categories?.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold">{activeCategory?.name ?? 'All products'}</h1>
        <p className="mt-1 text-muted-foreground">
          {productsQuery.data ? `${productsQuery.data.meta.total} items` : 'Browse the collection'}
        </p>
      </header>

      {/* Active filter chips */}
      {(category || q) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {q && (
            <Chip onRemove={() => setParam({ q: undefined })}>Search: “{q}”</Chip>
          )}
          {activeCategory && (
            <Chip onRemove={() => setParam({ category: undefined })}>{activeCategory.name}</Chip>
          )}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Filters rail (desktop) */}
        <aside className="hidden lg:block">
          <FilterPanel categories={categories} activeCategory={category} onCategory={(slug) => setParam({ category: slug })} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setMobileFilters(true)}
              className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'lg:hidden' })}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              Sort
              <Select
                value={`${sortParam}:${orderParam}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split(':');
                  setParam({ sort, order });
                }}
                className="h-9 w-48"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <ProductGrid
            products={productsQuery.data?.data}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            onRetry={() => productsQuery.refetch()}
          />

          {productsQuery.data && (
            <div className="mt-10">
              <Pagination
                page={productsQuery.data.meta.page}
                totalPages={productsQuery.data.meta.totalPages}
                total={productsQuery.data.meta.total}
                onPageChange={(p) => setParam({ page: String(p) })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFilters && (
        <div className="fixed inset-0 z-drawer lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button aria-label="Close" onClick={() => setMobileFilters(false)} className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-sunken">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              activeCategory={category}
              onCategory={(slug) => {
                setParam({ category: slug });
                setMobileFilters(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories,
  activeCategory,
  onCategory,
}: {
  categories: ReturnType<typeof useCategories>['data'];
  activeCategory?: string;
  onCategory: (slug: string | undefined) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Category</h3>
      <ul className="mt-3 space-y-1">
        <li>
          <button
            onClick={() => onCategory(undefined)}
            className={cn(
              'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
              !activeCategory ? 'bg-accent font-medium text-accent-foreground' : 'hover:bg-surface-sunken',
            )}
          >
            All products
          </button>
        </li>
        {(categories ?? []).map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onCategory(cat.slug)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeCategory === cat.slug ? 'bg-accent font-medium text-accent-foreground' : 'hover:bg-surface-sunken',
              )}
            >
              {cat.name}
              <span className="tabular text-xs text-muted-foreground">{cat.productCount}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm">
      {children}
      <button aria-label="Remove filter" onClick={onRemove} className="text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10" />}>
      <ProductsInner />
    </Suspense>
  );
}
