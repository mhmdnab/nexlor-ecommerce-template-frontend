'use client';

import type { ProductCard as ProductCardType } from '@repo/types';
import { EmptyState, ErrorState, Reveal, Skeleton } from '@repo/ui';
import { PackageSearch } from 'lucide-react';
import { ProductCard } from './ProductCard';

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full rounded-lg" />
          <div className="mt-3 flex justify-between gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  onRetry,
  priorityCount = 0,
}: {
  products: ProductCardType[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  priorityCount?: number;
}) {
  if (isLoading) return <ProductGridSkeleton />;
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-6 w-6" />}
        title="No products found"
        description="Try adjusting your filters or search terms."
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <Reveal key={p.id} delayIndex={Math.min(i, 7)}>
          <ProductCard product={p} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
