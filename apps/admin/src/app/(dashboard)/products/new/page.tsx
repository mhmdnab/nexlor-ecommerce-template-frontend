'use client';

import { Eyebrow } from '@repo/ui';
import Link from 'next/link';
import { ProductForm } from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">← Products</Link>
        <div className="mt-1">
          <Eyebrow>Product</Eyebrow>
          <h1 className="text-xl font-semibold">New product</h1>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
