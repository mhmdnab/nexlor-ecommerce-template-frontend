'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Eyebrow,
  Price,
  Skeleton,
  StatusBadge,
  formatDate,
} from '@repo/ui';
import { Package, ReceiptText, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useAdminCustomer } from '@/lib/queries';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: customer, isLoading, isError, refetch } = useAdminCustomer(id);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return <ErrorState description="Customer not found or failed to load." onRetry={() => refetch()} />;
  }

  const initials = customer.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/customers" className="text-sm text-muted-foreground hover:text-foreground">← Customers</Link>
        <div className="mt-2 flex items-center gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
            aria-hidden
          >
            {initials}
          </span>
          <div>
            <Eyebrow>Customer</Eyebrow>
            <h1 className="text-xl font-semibold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Order history */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-muted-foreground" aria-hidden />
              <CardTitle>Order history</CardTitle>
            </div>
            <CardDescription>All orders placed by this customer.</CardDescription>
          </CardHeader>
          {customer.orders.length === 0 ? (
            <EmptyState className="m-5 mt-0" icon={<Package className="h-6 w-6" />} title="No orders yet" description="This customer has not placed any orders." />
          ) : (
            <ul className="divide-y divide-border">
              {customer.orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken">
                    <div>
                      <p className="tabular text-sm font-medium">{o.orderNumber}</p>
                      <p className="tabular text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.itemCount} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      <Price cents={o.total} currency={o.currency} className="tabular text-sm font-medium" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Summary</CardTitle>
              </div>
              <CardDescription>Account stats and lifetime value.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Lifetime value</dt>
                  <dd><Price cents={customer.lifetimeValue} className="tabular font-semibold" /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Orders</dt>
                  <dd className="tabular font-medium">{customer.orderCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="tabular">{formatDate(customer.createdAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
