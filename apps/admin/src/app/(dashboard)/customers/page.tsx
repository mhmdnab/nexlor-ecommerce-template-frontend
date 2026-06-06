'use client';

import type { CustomerListItem } from '@repo/types';
import { Badge, Card, DataTable, ErrorState, GradientText, Input, Pagination, Price, formatDate, type Column } from '@repo/ui';
import { Search, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminCustomers } from '@/lib/queries';

export default function CustomersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAdminCustomers({ q: q || undefined, page, limit: 12 });

  const columns = useMemo<Column<CustomerListItem>[]>(
    () => [
      {
        key: 'name',
        header: 'Customer',
        cell: (c) => (
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.email}</p>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        cell: (c) => <Badge tone={c.role === 'CUSTOMER' ? 'neutral' : 'primary'}>{c.role.replace('_', ' ').toLowerCase()}</Badge>,
      },
      { key: 'orders', header: 'Orders', align: 'right', cell: (c) => <span className="tabular">{c.orderCount}</span> },
      { key: 'ltv', header: 'Lifetime value', align: 'right', cell: (c) => <Price cents={c.lifetimeValue} className="tabular font-medium" /> },
      { key: 'joined', header: 'Joined', align: 'right', cell: (c) => <span className="tabular text-muted-foreground">{formatDate(c.createdAt)}</span> },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          <GradientText>Customers</GradientText>
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Browse accounts, orders, and lifetime value.</p>
      </div>

      {/* Toolbar */}
      <Card className="px-4 py-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search name or email"
            className="pl-9"
            aria-label="Search customers"
          />
        </div>
      </Card>

      {/* Table or error */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/customers/${c.id}`)}
          empty={{ title: 'No customers', description: 'Customer accounts will appear here once orders are placed.', icon: <Users className="h-6 w-6" /> }}
        />
      )}

      {data && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
      )}
    </div>
  );
}
