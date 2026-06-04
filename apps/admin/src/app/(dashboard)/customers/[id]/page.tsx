'use client';

import { Card, EmptyState, Price, Skeleton, StatusBadge, formatDate } from '@repo/ui';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useAdminCustomer } from '@/lib/queries';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: customer, isLoading } = useAdminCustomer(id);

  if (isLoading || !customer) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/customers" className="text-sm text-muted-foreground hover:text-foreground">← Customers</Link>
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {customer.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
        </span>
        <div>
          <h1 className="text-xl font-semibold">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="text-base font-semibold">Order history</h2>
          </div>
          {customer.orders.length === 0 ? (
            <EmptyState className="m-5 mt-0" icon={<Package className="h-6 w-6" />} title="No orders yet" />
          ) : (
            <ul className="divide-y divide-border">
              {customer.orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken">
                    <div>
                      <p className="tabular text-sm font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.itemCount} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      <Price cents={o.total} currency={o.currency} className="text-sm font-medium" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lifetime value</dt>
                <dd><Price cents={customer.lifetimeValue} className="font-semibold" /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Orders</dt>
                <dd className="tabular font-medium">{customer.orderCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Joined</dt>
                <dd>{formatDate(customer.createdAt)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
