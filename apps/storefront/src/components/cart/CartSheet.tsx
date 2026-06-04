'use client';

import { EmptyState, Price, QuantityStepper, Sheet, Spinner, buttonVariants } from '@repo/ui';
import { ShoppingBag, Trash2 } from 'lucide-react';
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <Price cents={cart!.totals.subtotal} currency={currency} className="font-semibold" />
            </div>
            <p className="text-xs text-muted-foreground">Shipping &amp; taxes calculated at checkout.</p>
            <div className="flex flex-col gap-2">
              <Link href="/checkout" onClick={closeCart} className={buttonVariants({ className: 'w-full' })}>
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-center text-sm font-medium text-muted-foreground hover:text-foreground"
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
        <ul className="divide-y divide-border">
          {items.map((line) => (
            <li key={line.id} className="flex gap-4 py-4 first:pt-0">
              <Link
                href={`/products/${line.productSlug}`}
                onClick={closeCart}
                className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface-sunken"
              >
                {line.image && (
                  <Image src={line.image} alt={line.productName} fill sizes="64px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium leading-snug">{line.productName}</p>
                    <p className="text-xs text-muted-foreground">{line.variantName}</p>
                  </div>
                  <Price cents={line.lineTotal} currency={currency} className="text-sm font-medium" />
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QuantityStepper
                    size="sm"
                    value={line.quantity}
                    max={line.stock}
                    onChange={(q) => updateItem.mutate({ itemId: line.id, quantity: q })}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${line.productName}`}
                    onClick={() => removeItem.mutate(line.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
