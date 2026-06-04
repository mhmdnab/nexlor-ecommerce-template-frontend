'use client';

import type { ProductCard as ProductCardType } from '@repo/types';
import { Badge, Price, cn, useToast } from '@repo/ui';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartUI } from '@/app/providers';
import { useAddToCart, useProduct } from '@/lib/queries';

export function ProductCard({ product, priority }: { product: ProductCardType; priority?: boolean }) {
  const { openCart } = useCartUI();
  const { toast } = useToast();
  const add = useAddToCart();
  // Lazily resolve the default variant only when the user quick-adds.
  const productDetail = useProduct(product.slug);

  async function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    const detail = productDetail.data ?? (await productDetail.refetch()).data;
    const variant = detail?.variants.find((v) => v.inStock) ?? detail?.variants[0];
    if (!variant) return;
    try {
      await add.mutateAsync({ variantId: variant.id, quantity: 1 });
      toast({ title: 'Added to cart', description: product.name, tone: 'success' });
      openCart();
    } catch (err) {
      toast({ title: 'Could not add to cart', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-sunken">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-subtle-foreground">No image</div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {!product.inStock && <Badge tone="neutral">Sold out</Badge>}
          {product.inStock && product.lowStock && <Badge tone="warning">Low stock</Badge>}
          {product.inStock && product.isNew && !product.lowStock && <Badge tone="primary">New</Badge>}
        </div>

        {/* Quick-add: visible on mobile, reveals on hover for desktop. */}
        {product.inStock && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              'absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-surface text-foreground shadow-md',
              'transition-all duration-base hover:bg-primary hover:text-primary-foreground',
              'md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0',
              'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-foreground">{product.name}</h3>
        <Price cents={product.price} className="shrink-0 text-sm font-medium" />
      </div>
    </Link>
  );
}
