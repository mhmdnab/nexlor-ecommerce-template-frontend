'use client';

import { EmptyState, Price, QuantityStepper, Sheet, Spinner, buttonVariants, cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartUI } from '@/app/providers';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/lib/queries';

export function CartSheet() {
  const { open, setOpen, closeCart } = useCartUI();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = cart?.items ?? [];
  const currency = cart?.currency ?? 'USD';

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Your cart"
      description={cart && cart.itemCount > 0 ? `${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'}` : undefined}
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <Price cents={cart!.totals.subtotal} currency={currency} className="text-base font-semibold" />
            </div>
            <p className="text-xs text-muted-foreground">Shipping &amp; taxes calculated at checkout.</p>
            <div className="flex flex-col gap-2">
              {/* Solid CTA: the sheet sits on a surface panel, not a plain light bg, so
                  a gradient button would read thin on contrast. One primary per screen. */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className={buttonVariants({ size: 'lg', className: 'w-full' })}
              >
                Checkout
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View full cart
              </Link>
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Spinner className="h-6 w-6" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Browse the collection and add something you love."
          action={
            <Link href="/products" onClick={closeCart} className={buttonVariants()}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {items.map((line) => (
              <motion.li
                key={line.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden border-b border-border last:border-b-0"
              >
                <div className="flex gap-4 py-4">
                  <Link
                    href={`/products/${line.productSlug}`}
                    onClick={closeCart}
                    className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-sunken ring-1 ring-border"
                  >
                    {line.image && (
                      <Image src={line.image} alt={line.productName} fill sizes="64px" className="object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${line.productSlug}`}
                          onClick={closeCart}
                          className="block truncate text-sm font-medium leading-snug hover:underline"
                        >
                          {line.productName}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{line.variantName}</p>
                        {!line.inStock && <p className="mt-1 text-xs text-danger">Exceeds available stock</p>}
                      </div>
                      <Price cents={line.lineTotal} currency={currency} className="text-sm font-medium" />
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
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
                          'grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors',
                          'hover:bg-surface-sunken hover:text-danger',
                        )}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Sheet>
  );
}
