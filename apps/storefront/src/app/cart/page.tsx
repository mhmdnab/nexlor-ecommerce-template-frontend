'use client';

import { EmptyState, ErrorState, Price, QuantityStepper, Skeleton, buttonVariants } from '@repo/ui';
import { ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/lib/queries';

export default function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold">Your cart</h1>

      {isLoading ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      ) : isError ? (
        <div className="mt-8">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="When you add products they’ll show up here."
            action={
              <Link href="/products" className={buttonVariants()}>
                Browse products
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border">
            {cart.items.map((line) => (
              <li key={line.id} className="flex gap-4 py-5 first:pt-0">
                <Link
                  href={`/products/${line.productSlug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-surface-sunken"
                >
                  {line.image && <Image src={line.image} alt={line.productName} fill sizes="96px" className="object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/products/${line.productSlug}`} className="font-medium hover:underline">
                        {line.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground">{line.variantName}</p>
                      {!line.inStock && <p className="mt-1 text-sm text-danger">Exceeds available stock</p>}
                    </div>
                    <Price cents={line.lineTotal} currency={cart.currency} className="font-medium" />
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper
                      value={line.quantity}
                      max={line.stock}
                      onChange={(q) => updateItem.mutate({ itemId: line.id, quantity: q })}
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${line.productName}`}
                      onClick={() => removeItem.mutate(line.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary cart={cart}>
              <Link href="/checkout" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
                Proceed to checkout
              </Link>
            </CartSummary>
          </div>
        </div>
      )}
    </div>
  );
}
