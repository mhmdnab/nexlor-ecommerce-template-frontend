'use client';

import { OrderStatus, type OrderView } from '@repo/types';
import { DataTable, Input, Pagination, Price, StatusBadge, Tabs, formatDate, type Column } from '@repo/ui';
import { Search, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminOrders } from '@/lib/queries';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: OrderStatus.PENDING, label: 'Pending' },
  { value: OrderStatus.PAID, label: 'Paid' },
  { value: OrderStatus.FULFILLED, label: 'Fulfilled' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
  { value: OrderStatus.REFUNDED, label: 'Refunded' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ sort?: string; order: 'asc' | 'desc' }>({ sort: 'createdAt', order: 'desc' });

  const { data, isLoading } = useAdminOrders({
    q: q || undefined,
    status: status || undefined,
    page,
    limit: 12,
    sort: sort.sort,
    order: sort.order,
  });

  const columns = useMemo<Column<OrderView>[]>(
    () => [
      { key: 'orderNumber', header: 'Order', cell: (o) => <span className="tabular font-medium">{o.orderNumber}</span> },
      { key: 'email', header: 'Customer', cell: (o) => <span className="text-muted-foreground">{o.email}</span> },
      { key: 'createdAt', header: 'Date', sortable: true, cell: (o) => formatDate(o.createdAt) },
      { key: 'status', header: 'Status', sortable: true, cell: (o) => <StatusBadge status={o.status} /> },
      { key: 'items', header: 'Items', align: 'right', cell: (o) => <span className="tabular">{o.items.reduce((s, i) => s + i.quantity, 0)}</span> },
      { key: 'total', header: 'Total', sortable: true, align: 'right', cell: (o) => <Price cents={o.totals.total} currency={o.currency} className="font-medium" /> },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search order # or email" className="pl-9" aria-label="Search orders" />
      </div>

      <Tabs items={STATUS_TABS} value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        rowKey={(o) => o.id}
        onRowClick={(o) => router.push(`/orders/${o.id}`)}
        sort={sort}
        onSortChange={setSort}
        empty={{ title: 'No orders', description: 'Orders will appear here as they come in.', icon: <ShoppingCart className="h-6 w-6" /> }}
      />

      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />}
    </div>
  );
}
