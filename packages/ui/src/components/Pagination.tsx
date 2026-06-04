'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

/** Compact pagination control bound to page/totalPages. */
export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      <p className="text-sm text-muted-foreground">
        Page <span className="tabular font-medium text-foreground">{page}</span> of{' '}
        <span className="tabular font-medium text-foreground">{totalPages}</span>
        {typeof total === 'number' && <span className="ml-2 hidden sm:inline">· {total} total</span>}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
