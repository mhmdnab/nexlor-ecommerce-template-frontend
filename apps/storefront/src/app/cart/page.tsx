'use client';

import { Card, EmptyState, ErrorState, Eyebrow, Price, QuantityStepper, Skeleton, buttonVariants, cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
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
      <Eyebrow>Review &amp; checkout</Eyebrow>
      <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Your cart</h1>

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
          <Card className="divide-y divide-border p-2 sm:p-4">
            <AnimatePresence initial={false}>
              {cart.items.map((line) => (
                <motion.div
                  key={line.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 p-3 sm:p-4">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-sunken ring-1 ring-border"
                    >
                      {line.image && (
                        <Image src={line.image} alt={line.productName} fill sizes="96px" className="object-cover" />
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
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
                          className={cn(
                            'inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors',
                            'hover:text-danger',
                          )}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary cart={cart}>
              {/* Solid CTA: it lives inside the summary Card surface, not a plain
                  light bg — gradient would be thin on contrast. */}
              <Link href="/checkout" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
                Proceed to checkout
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CartSummary>
          </div>
        </div>
      )}
    </div>
  );
}
