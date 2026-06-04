'use client';

import type { CartView } from '@repo/types';
import { Button, Input, Price, useToast } from '@repo/ui';
import { Tag, X } from 'lucide-react';
import { useState } from 'react';
import { useApplyCoupon, useRemoveCoupon } from '@/lib/queries';

/** Order summary card with coupon entry — shared by cart page + checkout. */
export function CartSummary({ cart, children }: { cart: CartView; children?: React.ReactNode }) {
  const [code, setCode] = useState('');
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const { toast } = useToast();
  const currency = cart.currency;

  async function apply() {
    if (!code.trim()) return;
    try {
      await applyCoupon.mutateAsync(code.trim());
      toast({ title: 'Coupon applied', tone: 'success' });
      setCode('');
    } catch (err) {
      toast({ title: 'Invalid coupon', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">Order summary</h2>

      {/* Coupon */}
      <div className="mt-4">
        {cart.coupon?.valid ? (
          <div className="flex items-center justify-between rounded-md bg-success-subtle px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-success">
              <Tag className="h-4 w-4" aria-hidden /> {cart.coupon.code}
            </span>
            <button
              aria-label="Remove coupon"
              onClick={() => removeCoupon.mutate()}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          // Not a <form>: CartSummary renders inside the checkout <form>, and
          // nested forms are invalid HTML. Enter on the input still applies.
          <div className="flex gap-2">
            <Input
              placeholder="Discount code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  apply();
                }
              }}
              aria-label="Discount code"
            />
            <Button type="button" variant="secondary" loading={applyCoupon.isPending} onClick={apply}>
              Apply
            </Button>
          </div>
        )}
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Subtotal">
          <Price cents={cart.totals.subtotal} currency={currency} />
        </Row>
        {cart.totals.discount > 0 && (
          <Row label="Discount">
            <span className="text-success">
              −<Price cents={cart.totals.discount} currency={currency} />
            </span>
          </Row>
        )}
        <Row label="Shipping">
          {cart.totals.shipping === 0 ? (
            <span className="text-success">Free</span>
          ) : (
            <Price cents={cart.totals.shipping} currency={currency} />
          )}
        </Row>
        <Row label="Tax">
          <Price cents={cart.totals.tax} currency={currency} />
        </Row>
        <div className="border-t border-border pt-3">
          <Row label={<span className="text-base font-semibold">Total</span>}>
            <Price cents={cart.totals.total} currency={currency} className="text-base font-semibold" />
          </Row>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
