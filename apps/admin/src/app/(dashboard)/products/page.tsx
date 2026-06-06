'use client';

import { ProductStatus } from '@repo/types';
import {
  Button,
  Card,
  Checkbox,
  DataTable,
  ErrorState,
  GradientText,
  Input,
  Pagination,
  Price,
  Tabs,
  buttonVariants,
  cn,
  useToast,
  type Column,
} from '@repo/ui';
import { Package, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ProductStatusBadge } from '@/components/ProductStatusBadge';
import { useAdminProducts, useBulkStatus, type AdminProductQuery } from '@/lib/queries';
import type { ProductDetail } from '@repo/types';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: ProductStatus.ACTIVE, label: 'Active' },
  { value: ProductStatus.DRAFT, label: 'Draft' },
  { value: ProductStatus.ARCHIVED, label: 'Archived' },
];

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ sort?: string; order: 'asc' | 'desc' }>({ sort: 'createdAt', order: 'desc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params: AdminProductQuery = { q: q || undefined, status: status || undefined, page, limit: 12, sort: sort.sort, order: sort.order };
  const { data, isLoading, isError, refetch } = useAdminProducts(params);
  const bulkStatus = useBulkStatus();

  const rows = data?.data ?? [];
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected((prev) => {
      if (allSelected) return new Set();
      return new Set(rows.map((r) => r.id));
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function applyBulk(newStatus: string) {
    await bulkStatus.mutateAsync({ ids: [...selected], status: newStatus });
    toast({ title: `Updated ${selected.size} products`, tone: 'success' });
    setSelected(new Set());
  }

  const columns = useMemo<Column<ProductDetail>[]>(
    () => [
      {
        key: 'select',
        header: '',
        cell: (row) => (
          <span onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggleOne(row.id)} aria-label={`Select ${row.name}`} />
          </span>
        ),
        className: 'w-10',
      },
      {
        key: 'name',
        header: 'Product',
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded bg-surface-sunken">
              {row.images[0] && <Image src={row.images[0].url} alt="" fill sizes="36px" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.variants.length} variants</p>
            </div>
          </div>
        ),
      },
      { key: 'status', header: 'Status', cell: (row) => <ProductStatusBadge status={row.status} /> },
      {
        key: 'stock',
        header: 'Stock',
        align: 'right',
        cell: (row) => <span className="tabular">{row.variants.reduce((s, v) => s + v.stock, 0)}</span>,
      },
      {
        key: 'basePrice',
        header: 'Price',
        sortable: true,
        align: 'right',
        cell: (row) => <Price cents={row.price} className="tabular font-medium" />,
      },
    ],
    [selected],
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            <GradientText>Products</GradientText>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your catalog, variants, and stock.</p>
        </div>
        <Link href="/products/new" className={buttonVariants({ variant: 'gradient' })}>
          <Plus className="h-4 w-4" aria-hidden /> New product
        </Link>
      </div>

      {/* Toolbar */}
      <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search products"
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <div className="flex items-center gap-3">
          <Tabs items={STATUS_TABS} value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} />
          {selected.size > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm">
              <span className="tabular text-muted-foreground">{selected.size} selected</span>
              <Button size="sm" variant="secondary" loading={bulkStatus.isPending} onClick={() => applyBulk(ProductStatus.ACTIVE)}>
                Activate
              </Button>
              <Button size="sm" variant="ghost" onClick={() => applyBulk(ProductStatus.ARCHIVED)}>
                Archive
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Table or error */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/products/${r.id}`)}
          sort={sort}
          onSortChange={setSort}
          empty={{
            title: 'No products',
            description: 'Create your first product to get started.',
            icon: <Package className="h-6 w-6" />,
            action: (
              <Link href="/products/new" className={buttonVariants({ size: 'sm' })}>
                New product
              </Link>
            ),
          }}
        />
      )}

      {/* Pagination + select all */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
          <span className={cn(rows.length === 0 && 'opacity-50')}>Select all on this page</span>
        </div>
        {data && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
