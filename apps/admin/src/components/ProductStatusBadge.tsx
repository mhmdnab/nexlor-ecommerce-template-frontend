import { ProductStatus } from '@repo/types';
import { Badge } from '@repo/ui';
import { Archive, CheckCircle2, FileEdit } from 'lucide-react';

const MAP: Record<
  ProductStatus,
  { tone: 'success' | 'warning' | 'neutral'; label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  ACTIVE: { tone: 'success', label: 'Active', Icon: CheckCircle2 },
  DRAFT: { tone: 'warning', label: 'Draft', Icon: FileEdit },
  ARCHIVED: { tone: 'neutral', label: 'Archived', Icon: Archive },
};

/** Product status badge — icon + label, matching StatusBadge conventions. Color is never the only signal. */
export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { tone, label, Icon } = MAP[status];
  return (
    <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Badge>
  );
}
