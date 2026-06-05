'use client';

import { formatMoneyCompact } from '@repo/ui';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const revenues = data.map((d) => d.revenue);
  const min = revenues.length ? Math.min(...revenues) : 0;
  const max = revenues.length ? Math.max(...revenues) : 0;
  const srLabel = `Revenue over ${data.length} data point${data.length !== 1 ? 's' : ''}, ranging from ${formatMoneyCompact(min)} to ${formatMoneyCompact(max)}`;

  return (
    <figure role="img" aria-label={srLabel}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rev-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--gradient-from))" />
              <stop offset="100%" stopColor="hsl(var(--gradient-to))" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--divider))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatMoneyCompact(Number(v))}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--surface-raised))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
              fontSize: 13,
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number, name) => [
              name === 'revenue' ? formatMoneyCompact(value) : value,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="url(#rev-stroke)"
            strokeWidth={2}
            fill="url(#rev-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </figure>
  );
}
