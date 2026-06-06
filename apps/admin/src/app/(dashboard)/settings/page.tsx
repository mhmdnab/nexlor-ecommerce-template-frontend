'use client';

import { Role, type StoreSettings } from '@repo/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Eyebrow,
  Field,
  GradientText,
  Input,
  Select,
  Skeleton,
  Switch,
  useToast,
} from '@repo/ui';
import { AlertTriangle, Building2, DollarSign, Palette, ShoppingBag, Truck } from 'lucide-react';
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
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
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
      {/* Page header */}
      <div>
        <Eyebrow className="mb-1">System</Eyebrow>
        <h1 className="text-xl font-semibold tracking-tight">
          <GradientText>Settings</GradientText>
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure branding, commerce rules, and shipping defaults.
        </p>
      </div>

      {/* Role warning */}
      {!isSuperAdmin && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-subtle px-4 py-3 text-sm text-warning"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Only a SUPER_ADMIN can change store settings. Fields are read-only for your role.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">

          {/* Store Identity */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Store identity</CardTitle>
              </div>
              <CardDescription>Display name and tagline shown across your storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Store name" helper="Shown in the header, emails, and receipts.">
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    value={draft.branding.storeName}
                    disabled={!isSuperAdmin}
                    aria-describedby={describedBy}
                    onChange={(e) => set('branding', { storeName: e.target.value })}
                  />
                )}
              </Field>
              <Field label="Tagline" helper="Short brand message shown beneath the store name.">
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    value={draft.branding.tagline}
                    disabled={!isSuperAdmin}
                    aria-describedby={describedBy}
                    onChange={(e) => set('branding', { tagline: e.target.value })}
                  />
                )}
              </Field>
              <Field label="Logo URL" helper="Absolute URL to your logo image (SVG or PNG).">
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    value={draft.branding.logoUrl}
                    disabled={!isSuperAdmin}
                    aria-describedby={describedBy}
                    onChange={(e) => set('branding', { logoUrl: e.target.value })}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Branding</CardTitle>
              </div>
              <CardDescription>
                Accent color that maps to the{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs">--primary</code>{' '}
                token across both apps. The live preview updates instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Brand color" helper="Hex value — maps to the --primary CSS token.">
                {({ id, describedBy }) => (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draft.branding.brandColor}
                      disabled={!isSuperAdmin}
                      onChange={(e) => set('branding', { brandColor: e.target.value })}
                      className="h-11 w-12 cursor-pointer rounded-md border border-border-strong bg-surface p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Brand color picker"
                    />
                    <Input
                      id={id}
                      value={draft.branding.brandColor}
                      disabled={!isSuperAdmin}
                      aria-describedby={describedBy}
                      onChange={(e) => set('branding', { brandColor: e.target.value })}
                      className="max-w-[160px] font-mono"
                    />
                  </div>
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Commerce */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Commerce</CardTitle>
              </div>
              <CardDescription>Currency, tax rate, and tax-inclusion behaviour.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Currency" helper="ISO 4217 code used on all prices.">
                  {({ id, describedBy }) => (
                    <Select
                      id={id}
                      value={draft.commerce.currency}
                      disabled={!isSuperAdmin}
                      aria-describedby={describedBy}
                      onChange={(e) => set('commerce', { currency: e.target.value })}
                    >
                      {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field
                  label="Tax rate (%)"
                  helper="Applied at checkout (server-computed)."
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      value={draft.commerce.taxRatePercent}
                      disabled={!isSuperAdmin}
                      aria-describedby={describedBy}
                      className="tabular"
                      onChange={(e) =>
                        set('commerce', { taxRatePercent: Number(e.target.value) })
                      }
                    />
                  )}
                </Field>
              </div>

              <div className="flex min-h-[44px] items-center justify-between rounded-md border border-border px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">Prices include tax</p>
                  <p className="text-xs text-muted-foreground">
                    When on, displayed prices already include the tax rate.
                  </p>
                </div>
                <Switch
                  checked={draft.commerce.taxInclusive}
                  disabled={!isSuperAdmin}
                  onCheckedChange={(v) => set('commerce', { taxInclusive: v })}
                  aria-label="Tax inclusive"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Shipping</CardTitle>
              </div>
              <CardDescription>
                Flat-rate fee and free-shipping threshold. Amounts are displayed in dollars;
                stored as integer cents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Flat rate (USD)"
                  helper="Applied to every order unless threshold is met."
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      inputMode="decimal"
                      value={(draft.shipping.flatRate / 100).toFixed(2)}
                      disabled={!isSuperAdmin}
                      aria-describedby={describedBy}
                      className="tabular"
                      onChange={(e) =>
                        set('shipping', {
                          flatRate: Math.round(parseFloat(e.target.value || '0') * 100),
                        })
                      }
                    />
                  )}
                </Field>
                <Field
                  label="Free shipping over (USD)"
                  helper="Orders at or above this subtotal ship free."
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      inputMode="decimal"
                      value={(draft.shipping.freeShippingThreshold / 100).toFixed(2)}
                      disabled={!isSuperAdmin}
                      aria-describedby={describedBy}
                      className="tabular"
                      onChange={(e) =>
                        set('shipping', {
                          freeShippingThreshold: Math.round(
                            parseFloat(e.target.value || '0') * 100,
                          ),
                        })
                      }
                    />
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <div className="flex justify-end">
              <Button loading={save.isPending} onClick={onSave}>
                Save settings
              </Button>
            </div>
          )}
        </div>

        {/* Live brand-color preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Live preview
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Updates as you edit the brand color.
              </CardDescription>
            </CardHeader>
            <div
              className="border-t border-border p-5"
              style={{ ['--primary' as string]: hexToHsl(draft.branding.brandColor) }}
            >
              <div className="font-serif text-2xl font-semibold">
                {draft.branding.storeName || 'Store name'}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{draft.branding.tagline}</p>
              <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Primary button
              </button>
              <p className="mt-4 text-xs text-muted-foreground">
                Free shipping over{' '}
                <span className="tabular">
                  {(draft.shipping.freeShippingThreshold / 100).toFixed(0)}
                </span>{' '}
                {draft.commerce.currency}
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
