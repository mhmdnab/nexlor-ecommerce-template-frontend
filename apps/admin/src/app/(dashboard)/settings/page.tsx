'use client';

import { Role, type StoreSettings } from '@repo/types';
import { Button, Card, Field, Input, Select, Skeleton, Switch, useToast } from '@repo/ui';
import { useEffect, useState } from 'react';
import { useAdminSettings, useMe, useSaveSettings } from '@/lib/queries';

export default function SettingsPage() {
  const { data: me } = useMe();
  const { data: settings, isLoading } = useAdminSettings();
  const save = useSaveSettings();
  const { toast } = useToast();
  const [draft, setDraft] = useState<StoreSettings | null>(null);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const isSuperAdmin = me?.role === Role.SUPER_ADMIN;

  if (isLoading || !draft) {
    return <Skeleton className="h-96 rounded-lg" />;
  }

  function set<K extends keyof StoreSettings>(section: K, value: Partial<StoreSettings[K]>) {
    setDraft((d) => (d ? { ...d, [section]: { ...d[section], ...value } } : d));
  }

  async function onSave() {
    if (!draft) return;
    try {
      await save.mutateAsync(draft);
      toast({ title: 'Settings saved', tone: 'success' });
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      {!isSuperAdmin && (
        <div className="rounded-md border border-warning/40 bg-warning-subtle px-4 py-3 text-sm text-warning">
          Only a SUPER_ADMIN can change store settings. Fields are read-only for your role.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Branding */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-semibold">Branding</h2>
            <Field label="Store name">
              {({ id }) => <Input id={id} value={draft.branding.storeName} disabled={!isSuperAdmin} onChange={(e) => set('branding', { storeName: e.target.value })} />}
            </Field>
            <Field label="Tagline">
              {({ id }) => <Input id={id} value={draft.branding.tagline} disabled={!isSuperAdmin} onChange={(e) => set('branding', { tagline: e.target.value })} />}
            </Field>
            <Field label="Logo URL">
              {({ id }) => <Input id={id} value={draft.branding.logoUrl} disabled={!isSuperAdmin} onChange={(e) => set('branding', { logoUrl: e.target.value })} />}
            </Field>
            <Field label="Brand color (hex)" helper="Maps to the --primary token across both apps.">
              {({ id }) => (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.branding.brandColor}
                    disabled={!isSuperAdmin}
                    onChange={(e) => set('branding', { brandColor: e.target.value })}
                    className="h-10 w-12 cursor-pointer rounded border border-border-strong bg-surface"
                    aria-label="Brand color picker"
                  />
                  <Input id={id} value={draft.branding.brandColor} disabled={!isSuperAdmin} onChange={(e) => set('branding', { brandColor: e.target.value })} className="max-w-[160px]" />
                </div>
              )}
            </Field>
          </Card>

          {/* Commerce */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-semibold">Commerce</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Currency">
                {({ id }) => (
                  <Select id={id} value={draft.commerce.currency} disabled={!isSuperAdmin} onChange={(e) => set('commerce', { currency: e.target.value })}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Tax rate (%)">
                {({ id }) => <Input id={id} type="number" value={draft.commerce.taxRatePercent} disabled={!isSuperAdmin} onChange={(e) => set('commerce', { taxRatePercent: Number(e.target.value) })} />}
              </Field>
            </div>
            <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <span className="text-sm font-medium">Prices include tax</span>
              <Switch checked={draft.commerce.taxInclusive} disabled={!isSuperAdmin} onCheckedChange={(v) => set('commerce', { taxInclusive: v })} aria-label="Tax inclusive" />
            </label>
          </Card>

          {/* Shipping */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-semibold">Shipping</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Flat rate (USD)">
                {({ id }) => <Input id={id} inputMode="decimal" value={(draft.shipping.flatRate / 100).toFixed(2)} disabled={!isSuperAdmin} onChange={(e) => set('shipping', { flatRate: Math.round(parseFloat(e.target.value || '0') * 100) })} />}
              </Field>
              <Field label="Free shipping over (USD)">
                {({ id }) => <Input id={id} inputMode="decimal" value={(draft.shipping.freeShippingThreshold / 100).toFixed(2)} disabled={!isSuperAdmin} onChange={(e) => set('shipping', { freeShippingThreshold: Math.round(parseFloat(e.target.value || '0') * 100) })} />}
              </Field>
            </div>
          </Card>

          {isSuperAdmin && (
            <div className="flex justify-end">
              <Button loading={save.isPending} onClick={onSave}>Save settings</Button>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
            <div className="border-t border-border p-5" style={{ ['--primary' as string]: hexToHsl(draft.branding.brandColor) }}>
              <div className="font-serif text-2xl font-semibold">{draft.branding.storeName || 'Store name'}</div>
              <p className="mt-1 text-sm text-muted-foreground">{draft.branding.tagline}</p>
              <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Primary button
              </button>
              <p className="mt-4 text-xs text-muted-foreground">
                Free shipping over {(draft.shipping.freeShippingThreshold / 100).toFixed(0)} {draft.commerce.currency}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Convert #rrggbb to "h s% l%" for the --primary CSS variable preview. */
function hexToHsl(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return '243 75% 59%';
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
