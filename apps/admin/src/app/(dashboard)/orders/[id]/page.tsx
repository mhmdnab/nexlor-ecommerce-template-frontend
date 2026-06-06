'use client';

import { OrderStatus } from '@repo/types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  ErrorState,
  Eyebrow,
  Price,
  Select,
  Skeleton,
  StatusBadge,
  cn,
  formatDateTime,
  useToast,
} from '@repo/ui';
import { Check, MapPin, ShoppingBag, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { useAdminOrder, useUpdateOrderStatus } from '@/lib/queries';

const FLOW: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.FULFILLED];
const DESTRUCTIVE = new Set<OrderStatus>([OrderStatus.CANCELLED, OrderStatus.REFUNDED]);

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const [next, setNext] = useState<OrderStatus | ''>('');
  const [confirm, setConfirm] = useState<OrderStatus | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-56" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return <ErrorState description="Order not found or failed to load." onRetry={() => refetch()} />;
  }

  async function apply(status: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: `Order marked ${status.toLowerCase()}`, tone: 'success' });
      setNext('');
      setConfirm(null);
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, tone: 'error' });
    }
  }

  function requestChange() {
    if (!next) return;
    if (DESTRUCTIVE.has(next)) setConfirm(next);
    else apply(next);
  }

  const currentIndex = FLOW.indexOf(order.status);
  const isTerminal = DESTRUCTIVE.has(order.status);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">← Orders</Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Eyebrow>Order</Eyebrow>
          <h1 className="tabular text-xl font-semibold">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
          <span className="tabular text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Line items */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Items</CardTitle>
              </div>
              <CardDescription>Products included in this order.</CardDescription>
            </CardHeader>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-surface-sunken">
                    {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="tabular text-xs text-muted-foreground">{item.variantName} · {item.sku}</p>
                  </div>
                  <span className="tabular text-sm text-muted-foreground">
                    {item.quantity} × <Price cents={item.unitPrice} currency={order.currency} />
                  </span>
                  <Price cents={item.lineTotal} currency={order.currency} className="tabular w-20 text-right text-sm font-medium" />
                </li>
              ))}
            </ul>
            {/* Server-driven totals — NO client math */}
            <dl className="space-y-2 border-t border-border p-5 text-sm">
              <Row label="Subtotal"><Price cents={order.totals.subtotal} currency={order.currency} /></Row>
              {order.totals.discount > 0 && (
                <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}>
                  <span className="text-success">−<Price cents={order.totals.discount} currency={order.currency} /></span>
                </Row>
              )}
              <Row label="Shipping"><Price cents={order.totals.shipping} currency={order.currency} /></Row>
              <Row label="Tax"><Price cents={order.totals.tax} currency={order.currency} /></Row>
              <div className="border-t border-border pt-2">
                <Row label={<span className="font-semibold text-foreground">Total</span>}>
                  <Price cents={order.totals.total} currency={order.currency} className="tabular font-semibold" />
                </Row>
              </div>
            </dl>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status control */}
          <Card>
            <CardHeader>
              <CardTitle>Order status</CardTitle>
              <CardDescription>Update the fulfillment stage for this order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vertical timeline */}
              <ol className="space-y-3">
                {FLOW.map((step, i) => {
                  const done = !isTerminal && i <= currentIndex;
                  const current = !isTerminal && i === currentIndex;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'grid h-6 w-6 place-items-center rounded-full border text-xs',
                          done ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong text-muted-foreground',
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                      </span>
                      <span className={cn('text-sm', current ? 'font-semibold' : done ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.charAt(0) + step.slice(1).toLowerCase()}
                      </span>
                    </li>
                  );
                })}
                {isTerminal && (
                  <li className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-danger bg-danger-subtle text-xs text-danger">!</span>
                    <span className="text-sm font-semibold text-danger">{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</span>
                  </li>
                )}
              </ol>

              <div className="space-y-2 border-t border-border pt-4">
                <Select value={next} onChange={(e) => setNext(e.target.value as OrderStatus)} aria-label="New status">
                  <option value="">Change status…</option>
                  {Object.values(OrderStatus).filter((s) => s !== order.status).map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
                <Button className="w-full" disabled={!next} loading={updateStatus.isPending} onClick={requestChange}>
                  Update status
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.email}</p>
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Shipping address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p className="text-muted-foreground">{order.shippingAddress.line2}</p>}
              <p className="tabular text-muted-foreground">
                {order.shippingAddress.city}{order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ''} {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm destructive status change */}
      <Dialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Mark order ${confirm?.toLowerCase()}?`}
        description="This is a significant status change. Make sure it's intended."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" loading={updateStatus.isPending} onClick={() => confirm && apply(confirm)}>
              Confirm
            </Button>
          </>
        }
      />
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular">{children}</dd>
    </div>
  );
}
