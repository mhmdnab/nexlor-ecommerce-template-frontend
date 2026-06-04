import { ProductStatus } from '@repo/types';
import { Badge } from '@repo/ui';

const MAP: Record<ProductStatus, { tone: 'success' | 'warning' | 'neutral'; label: string }> = {
  ACTIVE: { tone: 'success', label: 'Active' },
  DRAFT: { tone: 'warning', label: 'Draft' },
  ARCHIVED: { tone: 'neutral', label: 'Archived' },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { tone, label } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}
