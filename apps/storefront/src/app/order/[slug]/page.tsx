'use client';

import {
  Button,
  Card,
  CardContent,
  Eyebrow,
  GradientText,
  Price,
  Reveal,
  Section,
  Skeleton,
  StatusBadge,
  buttonVariants,
  cn,
} from '@repo/ui';
import { ArrowRight, CheckCircle2, MapPin, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { useOrder } from '@/lib/queries';

export default function OrderConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: order, isLoading, isError, refetch } = useOrder(slug);

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Skeleton className="h-5 w-20 mb-4" />
        <Skeleton className="mx-auto h-14 w-14 rounded-full mb-6" />
        <Skeleton className="mx-auto h-10 w-72 mb-2" />
        <Skeleton className="mx-auto h-5 w-52 mb-10" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  /* ── Error / not-found state ── */
  if (isError || !order) {
    return (
      <Section tone="default" container>
        <div className="mx-auto max-w-lg text-center">
          <Eyebrow>Order lookup</Eyebrow>
          <h1 className="mt-3 font-serif text-4xl font-semibold">Order not found</h1>
          <p className="mt-3 text-muted-foreground">
            We couldn&apos;t find an order matching that number. It may not exist or you may not have access.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button variant="secondary" size="lg" onClick={() => refetch()} aria-label="Retry loading the order">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
            <Link href="/products" className={cn(buttonVariants({ size: 'lg' }))}>
              Continue shopping
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>
    );
  }

  const addr = order.shippingAddress as {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* ── Success header ── */}
      <Reveal>
        <div className="text-center">
          <div
            className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-success-subtle text-success"
            aria-hidden
          >
            <CheckCircle2 className="h-7 w-7" aria-hidden />
          </div>
          <Eyebrow className="mb-3">Order confirmed</Eyebrow>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Thank you for <GradientText>your order</GradientText>
          </h1>
          <p className="mt-3 text-muted-foreground">
            A confirmation was sent to{' '}
            <span className="font-medium text-foreground">{order.email}</span>.
          </p>
          <p className="mt-1 text-muted-foreground">
            Order{' '}
            <span className="tabular font-semibold text-foreground">{order.orderNumber}</span>
          </p>
          <div className="mt-4 flex justify-center">
            <StatusBadge status={order.status} />
          </div>
        </div>
      </Reveal>

      {/* ── Line items ── */}
      <Reveal delayIndex={1} className="mt-10">
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border" role="list" aria-label="Order items">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 px-5 py-4 first:pt-5 last:pb-5">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-surface-sunken">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.variantName} · Qty{' '}
                        <span className="tabular">{item.quantity}</span>
                      </p>
                    </div>
                    <Price
                      cents={item.lineTotal}
                      currency={order.currency}
                      className="tabular shrink-0 text-sm font-medium"
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* ── Server-driven totals — never computed client-side ── */}
            <div className="border-t border-border px-5 pb-5 pt-4">
              <dl className="space-y-2 text-sm">
                <SummaryRow label="Subtotal">
                  <Price cents={order.totals.subtotal} currency={order.currency} className="tabular" />
                </SummaryRow>
                {order.totals.discount > 0 && (
                  <SummaryRow label="Discount">
                    <span className="tabular text-success">
                      &minus;<Price cents={order.totals.discount} currency={order.currency} />
                    </span>
                  </SummaryRow>
                )}
                <SummaryRow label="Shipping">
                  {order.totals.shipping === 0 ? (
                    <span className="tabular text-success">Free</span>
                  ) : (
                    <Price cents={order.totals.shipping} currency={order.currency} className="tabular" />
                  )}
                </SummaryRow>
                <SummaryRow label="Tax">
                  <Price cents={order.totals.tax} currency={order.currency} className="tabular" />
                </SummaryRow>
                <div className="mt-2 border-t border-border pt-3">
                  <SummaryRow
                    label={<span className="font-semibold text-foreground">Total</span>}
                  >
                    <Price
                      cents={order.totals.total}
                      currency={order.currency}
                      className="tabular font-semibold text-foreground"
                    />
                  </SummaryRow>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Shipping address ── */}
      {addr && (
        <Reveal delayIndex={2} className="mt-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">Shipping address</p>
                  {addr.line1 && <p className="text-sm text-muted-foreground">{addr.line1}</p>}
                  {addr.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
                  {(addr.city || addr.state || addr.zip) && (
                    <p className="text-sm text-muted-foreground">
                      {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {addr.country && <p className="text-sm text-muted-foreground">{addr.country}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* ── Primary CTA ── */}
      <Reveal delayIndex={3} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {/* ONE primary CTA — on a light/default surface: solid primary button is correct */}
        <Link href="/products" className={cn(buttonVariants({ size: 'lg' }))}>
          Continue shopping
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/account" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}>
          View all orders
        </Link>
      </Reveal>
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
