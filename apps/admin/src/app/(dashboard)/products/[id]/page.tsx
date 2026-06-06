'use client';

import { ErrorState, Eyebrow, Skeleton } from '@repo/ui';
import Link from 'next/link';
import { use } from 'react';
import { ProductForm } from '@/components/ProductForm';
import { useAdminProduct } from '@/lib/queries';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading, isError, refetch } = useAdminProduct(id);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-5">
        <div>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">← Products</Link>
          <div className="mt-1">
            <Eyebrow>Product</Eyebrow>
            <h1 className="text-xl font-semibold">Edit product</h1>
          </div>
        </div>
        <ErrorState description="Product not found or failed to load." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">← Products</Link>
        <div className="mt-1">
          <Eyebrow>Product</Eyebrow>
          <h1 className="text-xl font-semibold">Edit product</h1>
        </div>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
