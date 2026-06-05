'use client';

import {
  Card,
  EmptyState,
  ErrorState,
  GradientText,
  Price,
  Skeleton,
  StatusBadge,
  Tabs,
  cn,
  formatMoney,
  formatNumber,
  formatPercent,
} from '@repo/ui';
import { ArrowDownRight, ArrowUpRight, PackageX, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { RevenueChart } from '@/components/RevenueChart';
import { useOverview, useRecentOrders } from '@/lib/queries';

const GRANULARITIES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export default function OverviewPage() {
  const [granularity, setGranularity] = useState('day');
  const overview = useOverview(30, granularity);
  const recent = useRecentOrders();

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overview.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
          : overview.data && (
              <>
                <StatCard accent label="Revenue (30d)" value={formatMoney(overview.data.stats.revenue.value)} delta={overview.data.stats.revenue.delta} />
                <StatCard label="Orders (30d)" value={formatNumber(overview.data.stats.orders.value)} delta={overview.data.stats.orders.delta} />
                <StatCard label="Avg. order value" value={formatMoney(overview.data.stats.averageOrderValue.value)} delta={overview.data.stats.averageOrderValue.delta} />
                <StatCard label="New customers" value={formatNumber(overview.data.stats.newCustomers.value)} delta={overview.data.stats.newCustomers.delta} />
              </>
            )}
      </div>

      {/* Revenue chart */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Revenue</h2>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
          <Tabs items={GRANULARITIES} value={granularity} onValueChange={setGranularity} />
        </div>
        {overview.isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : overview.isError ? (
          <ErrorState onRetry={() => overview.refetch()} />
        ) : overview.data && overview.data.revenueSeries.length > 0 ? (
          <RevenueChart data={overview.data.revenueSeries} />
        ) : (
          <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No revenue yet" description="Paid orders will appear here." />
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent orders */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-base font-semibold">Recent orders</h2>
            <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recent.isLoading ? (
            <div className="space-y-2 p-5 pt-0">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recent.data || recent.data.length === 0 ? (
            <EmptyState className="m-5 mt-0" title="No orders yet" />
          ) : (
            <ul className="divide-y divide-border">
              {recent.data.map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken">
                    <div className="min-w-0">
                      <p className="tabular text-sm font-medium">{o.orderNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{o.email}</p>
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

        {/* Low stock */}
        <Card className="overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="text-base font-semibold">Low stock</h2>
            <p className="text-sm text-muted-foreground">Variants at or below 5 units</p>
          </div>
          {overview.isLoading ? (
            <div className="space-y-2 p-5 pt-0">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !overview.data || overview.data.lowStock.length === 0 ? (
            <EmptyState className="m-5 mt-0" icon={<PackageX className="h-6 w-6" />} title="Nothing low" description="All variants are well stocked." />
          ) : (
            <ul className="divide-y divide-border">
              {overview.data.lowStock.map((v) => (
                <li key={v.variantId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{v.productName}</p>
                    <p className="text-xs text-muted-foreground">{v.variantName} · {v.sku}</p>
                  </div>
                  <span className={cn('tabular rounded-full px-2 py-0.5 text-xs font-semibold', v.stock === 0 ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning')}>
                    {v.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, accent = false }: { label: string; value: string; delta: number | null; accent?: boolean }) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={cn('p-5', accent && 'relative overflow-hidden')}>
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-brand" aria-hidden />}
      <p className="text-sm text-muted-foreground">{label}</p>
      {accent ? (
        <GradientText className="tabular mt-2 block text-3xl font-semibold tracking-tight">{value}</GradientText>
      ) : (
        <p className="tabular mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      )}
      {delta !== null ? (
        <p className={cn('mt-1 inline-flex items-center gap-1 text-sm', positive ? 'text-success' : 'text-danger')}>
          {positive ? <ArrowUpRight className="h-4 w-4" aria-hidden /> : <ArrowDownRight className="h-4 w-4" aria-hidden />}
          {formatPercent(delta)}
          <span className="text-muted-foreground">vs prev.</span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">No prior data</p>
      )}
    </Card>
  );
}
