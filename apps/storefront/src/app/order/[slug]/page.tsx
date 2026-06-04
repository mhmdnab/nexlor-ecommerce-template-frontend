'use client';

import { Price, Skeleton, StatusBadge, buttonVariants } from '@repo/ui';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { useOrder } from '@/lib/queries';

export default function OrderConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: order, isLoading, isError } = useOrder(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-8 w-64" />
        <Skeleton className="mt-10 h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Order not found</h1>
        <p className="mt-2 text-muted-foreground">We couldn’t find an order with that number.</p>
        <Link href="/products" className={buttonVariants({ className: 'mt-6' })}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-5 font-serif text-3xl font-semibold">Thank you for your order</h1>
        <p className="mt-2 text-muted-foreground">
          A confirmation was sent to {order.email}. Your order number is{' '}
          <span className="tabular font-medium text-foreground">{order.orderNumber}</span>.
        </p>
        <div className="mt-4 flex justify-center">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-0">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-surface-sunken">
                {item.image && <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />}
              </div>
              <div className="flex flex-1 justify-between">
                <div>
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantName} · Qty {item.quantity}
                  </p>
                </div>
                <Price cents={item.lineTotal} currency={order.currency} className="text-sm" />
              </div>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <SummaryRow label="Subtotal"><Price cents={order.totals.subtotal} currency={order.currency} /></SummaryRow>
          {order.totals.discount > 0 && (
            <SummaryRow label="Discount"><span className="text-success">−<Price cents={order.totals.discount} currency={order.currency} /></span></SummaryRow>
          )}
          <SummaryRow label="Shipping">
            {order.totals.shipping === 0 ? <span className="text-success">Free</span> : <Price cents={order.totals.shipping} currency={order.currency} />}
          </SummaryRow>
          <SummaryRow label="Tax"><Price cents={order.totals.tax} currency={order.currency} /></SummaryRow>
          <div className="border-t border-border pt-2">
            <SummaryRow label={<span className="font-semibold text-foreground">Total</span>}>
              <Price cents={order.totals.total} currency={order.currency} className="font-semibold" />
            </SummaryRow>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/products" className={buttonVariants({ variant: 'secondary' })}>
          Continue shopping
        </Link>
        <Link href="/account" className={buttonVariants()}>
          View your orders
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
