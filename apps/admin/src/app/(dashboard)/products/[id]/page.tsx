'use client';

import { Skeleton } from '@repo/ui';
import { use } from 'react';
import { ProductForm } from '@/components/ProductForm';
import { useAdminProduct } from '@/lib/queries';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading, isError } = useAdminProduct(id);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }
  if (isError || !product) {
    return <p className="text-muted-foreground">Product not found.</p>;
  }
  return <ProductForm product={product} />;
}
