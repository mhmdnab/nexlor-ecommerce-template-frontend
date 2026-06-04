import { cn } from '../lib/cn';
import { formatMoney } from '../lib/money';

/** Price in tabular figures so columns/totals don't jitter. */
export function Price({
  cents,
  currency = 'USD',
  className,
}: {
  cents: number;
  currency?: string;
  className?: string;
}) {
  return <span className={cn('tabular', className)}>{formatMoney(cents, currency)}</span>;
}
