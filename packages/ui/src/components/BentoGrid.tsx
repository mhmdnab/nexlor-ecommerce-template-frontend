import { cn } from '../lib/cn';

export function BentoGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4', className)}
      {...props}
    />
  );
}

export interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span at lg+ (1–4). */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span (1–2). */
  rowSpan?: 1 | 2;
}

const colSpanClass: Record<NonNullable<BentoTileProps['colSpan']>, string> = {
  1: 'lg:col-span-1',
  2: 'col-span-2 lg:col-span-2',
  3: 'col-span-2 lg:col-span-3',
  4: 'col-span-2 lg:col-span-4',
};
const rowSpanClass: Record<NonNullable<BentoTileProps['rowSpan']>, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
};

export function BentoTile({ colSpan = 1, rowSpan = 1, className, ...props }: BentoTileProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface',
        'transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-lift',
        colSpanClass[colSpan],
        rowSpanClass[rowSpan],
        className,
      )}
      {...props}
    />
  );
}
