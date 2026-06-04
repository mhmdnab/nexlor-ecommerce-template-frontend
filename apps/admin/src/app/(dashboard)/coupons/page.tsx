'use client';

import { CouponType } from '@repo/types';
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  Field,
  Input,
  Select,
  Switch,
  formatMoney,
  useToast,
  type Column,
} from '@repo/ui';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  useAdminCoupons,
  useDeleteCoupon,
  useSaveCoupon,
  type Coupon,
} from '@/lib/queries';

export default function CouponsPage() {
  const { data, isLoading } = useAdminCoupons({ limit: 50 });
  const del = useDeleteCoupon();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Coupon | null | undefined>(undefined); // undefined=closed, null=new

  const columns: Column<Coupon>[] = [
    { key: 'code', header: 'Code', cell: (c) => <span className="tabular font-medium">{c.code}</span> },
    {
      key: 'value',
      header: 'Discount',
      cell: (c) => (c.type === CouponType.PERCENT ? `${c.value}%` : formatMoney(c.value)),
    },
    { key: 'active', header: 'Status', cell: (c) => <Badge tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'usage',
      header: 'Used',
      align: 'right',
      cell: (c) => <span className="tabular">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (c) => (
        <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button aria-label="Edit" onClick={() => setEditing(c)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-surface-sunken">
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            aria-label="Delete"
            onClick={async () => {
              await del.mutateAsync(c.id);
              toast({ title: 'Coupon deleted', tone: 'success' });
            }}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-danger"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" aria-hidden /> New coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        rowKey={(c) => c.id}
        empty={{ title: 'No coupons', description: 'Create a discount code to get started.', icon: <Ticket className="h-6 w-6" /> }}
      />

      {editing !== undefined && (
        <CouponDialog coupon={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}

function CouponDialog({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const save = useSaveCoupon();
  const { toast } = useToast();
  const [code, setCode] = useState(coupon?.code ?? '');
  const [type, setType] = useState<CouponType>(coupon?.type ?? CouponType.PERCENT);
  const [value, setValue] = useState(
    coupon ? (coupon.type === CouponType.PERCENT ? String(coupon.value) : (coupon.value / 100).toFixed(2)) : '',
  );
  const [active, setActive] = useState(coupon?.active ?? true);
  const [minSubtotal, setMinSubtotal] = useState(coupon?.minSubtotal != null ? (coupon.minSubtotal / 100).toFixed(2) : '');
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : '');

  async function submit() {
    const body = {
      code: code.toUpperCase().trim(),
      type,
      value: type === CouponType.PERCENT ? parseInt(value || '0', 10) : Math.round(parseFloat(value || '0') * 100),
      active,
      minSubtotal: minSubtotal ? Math.round(parseFloat(minSubtotal) * 100) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
    };
    try {
      await save.mutateAsync({ id: coupon?.id, body });
      toast({ title: coupon ? 'Coupon updated' : 'Coupon created', tone: 'success' });
      onClose();
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={coupon ? 'Edit coupon' : 'New coupon'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} onClick={submit}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Code" required>
          {({ id }) => <Input id={id} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            {({ id }) => (
              <Select id={id} value={type} onChange={(e) => setType(e.target.value as CouponType)}>
                <option value={CouponType.PERCENT}>Percent (%)</option>
                <option value={CouponType.FIXED}>Fixed ($)</option>
              </Select>
            )}
          </Field>
          <Field label={type === CouponType.PERCENT ? 'Percent off' : 'Amount off (USD)'} required>
            {({ id }) => <Input id={id} value={value} inputMode="decimal" onChange={(e) => setValue(e.target.value)} />}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min. subtotal (USD)">
            {({ id }) => <Input id={id} value={minSubtotal} inputMode="decimal" onChange={(e) => setMinSubtotal(e.target.value)} placeholder="none" />}
          </Field>
          <Field label="Usage limit">
            {({ id }) => <Input id={id} value={usageLimit} inputMode="numeric" onChange={(e) => setUsageLimit(e.target.value)} placeholder="unlimited" />}
          </Field>
        </div>
        <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
          <span className="text-sm font-medium">Active</span>
          <Switch checked={active} onCheckedChange={setActive} aria-label="Active" />
        </label>
      </div>
    </Dialog>
  );
}
