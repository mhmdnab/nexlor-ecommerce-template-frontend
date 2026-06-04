'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../lib/cn';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export interface SortState {
  sort?: string;
  order: 'asc' | 'desc';
}

/**
 * Reusable admin data table: sortable headers (aria-sort), sticky header,
 * loading skeleton, empty state, row click. Horizontally scrolls on small
 * screens. Pair with the Pagination component for paging.
 */
export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  empty,
}: {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: SortState;
  onSortChange?: (next: SortState) => void;
  empty?: { title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode };
}) {
  function toggleSort(key: string) {
    if (!onSortChange) return;
    const order: 'asc' | 'desc' = sort?.sort === key && sort.order === 'asc' ? 'desc' : 'asc';
    onSortChange({ sort: key, order });
  }

  const alignClass = (a?: string) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-sticky bg-surface-sunken">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.sort === col.key;
                const ariaSort = !isSorted ? 'none' : sort?.order === 'asc' ? 'ascending' : 'descending';
                return (
                  <th
                    key={col.key}
                    aria-sort={col.sortable ? (ariaSort as 'none' | 'ascending' | 'descending') : undefined}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                      alignClass(col.align),
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
                          col.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        {col.header}
                        {!isSorted ? (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
                        ) : sort?.order === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'border-t border-border transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-surface-sunken',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('px-4 py-3.5 align-middle', alignClass(col.align), col.className)}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!loading && data.length === 0 && (
        <EmptyState
          className="rounded-none border-0 border-t"
          title={empty?.title ?? 'Nothing here yet'}
          description={empty?.description}
          icon={empty?.icon}
          action={empty?.action}
        />
      )}
    </div>
  );
}
