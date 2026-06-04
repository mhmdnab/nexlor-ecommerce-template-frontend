import { ORDER_STATUS_TONE, type OrderStatus } from '@repo/types';
import { CheckCircle2, Clock, CreditCard, PackageCheck, RotateCcw, XCircle } from 'lucide-react';
import { Badge } from './Badge';

const ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  PAID: CreditCard,
  FULFILLED: PackageCheck,
  CANCELLED: XCircle,
  REFUNDED: RotateCcw,
};

const LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

/** Order status as a badge — color is never the only signal (icon + label too). */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon = ICONS[status] ?? CheckCircle2;
  return (
    <Badge tone={ORDER_STATUS_TONE[status]}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {LABELS[status]}
    </Badge>
  );
}
