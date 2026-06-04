'use client';

import { OrderStatus } from '@repo/types';
import {
  Badge,
  BentoGrid,
  BentoTile,
  Button,
  Card,
  Checkbox,
  Dialog,
  EmptyState,
  ErrorState,
  Eyebrow,
  Field,
  GlassPanel,
  GradientText,
  Input,
  MagneticButton,
  Marquee,
  Price,
  QuantityStepper,
  Reveal,
  Section as UiSection,
  Select,
  Sheet,
  Skeleton,
  StatusBadge,
  Switch,
  Tabs,
  Textarea,
  useToast,
} from '@repo/ui';
import { Inbox, Mail } from 'lucide-react';
import { useState } from 'react';

const COLOR_TOKENS = [
  'background', 'surface', 'surface-raised', 'surface-sunken',
  'foreground', 'muted-foreground', 'subtle-foreground',
  'primary', 'accent', 'success', 'warning', 'danger', 'info',
];

export default function StyleguidePage() {
  const { toast } = useToast();
  const [check, setCheck] = useState(true);
  const [sw, setSw] = useState(true);
  const [qty, setQty] = useState(2);
  const [tab, setTab] = useState('one');
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <div className="space-y-10 pb-16">
      <header>
        <h1 className="text-2xl font-semibold">Style guide</h1>
        <p className="mt-1 text-muted-foreground">
          Every primitive in every state. Toggle the theme (top-right) to verify light + dark.
        </p>
      </header>

      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {COLOR_TOKENS.map((token) => (
            <div key={token} className="overflow-hidden rounded-md border border-border">
              <div className="h-14" style={{ backgroundColor: `hsl(var(--${token}))` }} />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">{token}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Badges & status">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(OrderStatus).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-xl gap-4">
          <Field label="Email" required helper="We’ll never share it.">
            {({ id }) => <Input id={id} placeholder="you@example.com" />}
          </Field>
          <Field label="With error" error="This field is required.">
            {({ id, invalid }) => <Input id={id} invalid={invalid} placeholder="Invalid" />}
          </Field>
          <Field label="Select">
            {({ id }) => (
              <Select id={id}>
                <option>Option one</option>
                <option>Option two</option>
              </Select>
            )}
          </Field>
          <Field label="Textarea">
            {({ id }) => <Textarea id={id} placeholder="Notes…" />}
          </Field>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={check} onCheckedChange={setCheck} aria-label="Demo checkbox" /> Checkbox
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={sw} onCheckedChange={setSw} aria-label="Demo switch" /> Switch
            </label>
            <QuantityStepper value={qty} onChange={setQty} />
          </div>
        </div>
      </Section>

      <Section title="Overlays & feedback">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialog(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>Open sheet</Button>
          <Button variant="secondary" onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.', tone: 'success' })}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast({ title: 'Something failed', tone: 'error' })}>Error toast</Button>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs
          items={[
            { value: 'one', label: 'Overview' },
            { value: 'two', label: 'Details' },
            { value: 'three', label: 'History' },
          ]}
          value={tab}
          onValueChange={setTab}
        />
      </Section>

      <Section title="Price (tabular)">
        <div className="space-y-1">
          <Price cents={1999} className="block text-lg" />
          <Price cents={129900} className="block text-lg" />
          <Price cents={500} className="block text-lg" />
        </div>
      </Section>

      <Section title="Loading / empty / error">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3 p-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </Card>
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="Nothing here" description="When items exist they’ll appear here." />
          <ErrorState onRetry={() => toast({ title: 'Retried', tone: 'info' })} />
        </div>
      </Section>

      <Section title="Immersive foundation">
        <div className="space-y-6">
          {/* Gradient + glow + gradient button + magnetic */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="gradient">Gradient CTA</Button>
            <MagneticButton>
              <Button variant="gradient">Magnetic CTA</Button>
            </MagneticButton>
            <span className="rounded-2xl bg-gradient-brand px-4 py-2 text-sm text-primary-foreground shadow-glow">
              bg-gradient-brand + shadow-glow
            </span>
            <GradientText className="font-serif text-3xl font-semibold">Astonishing</GradientText>
          </div>

          {/* Eyebrow + inverse surface band */}
          <div className="overflow-hidden rounded-2xl bg-surface-inverse p-6 text-surface-inverse-foreground">
            <Eyebrow>New season</Eyebrow>
            <p className="mt-2 font-serif text-2xl">Inverse drama surface</p>
            <p className="mt-1 text-sm text-surface-inverse-muted">muted text on inverse</p>
          </div>

          {/* Glass panel over a gradient backdrop */}
          <div className="relative h-28 overflow-hidden rounded-2xl bg-gradient-brand">
            <GlassPanel className="absolute inset-x-4 bottom-4 rounded-xl p-3 text-sm">
              GlassPanel overlay (blurs what is behind)
            </GlassPanel>
          </div>

          {/* Bento + hover lift */}
          <BentoGrid>
            <BentoTile colSpan={2} rowSpan={1} className="p-5">
              <p className="font-serif text-xl">Bento tile · span 2</p>
              <p className="text-sm text-muted-foreground">hover to see lift + shadow</p>
            </BentoTile>
            <BentoTile className="p-5"><p className="text-sm">Tile</p></BentoTile>
            <BentoTile className="p-5"><p className="text-sm">Tile</p></BentoTile>
          </BentoGrid>

          {/* Reveal stagger */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Reveal key={i} delayIndex={i}>
                <Card interactive className="p-4 text-sm">Reveal #{i + 1}</Card>
              </Reveal>
            ))}
          </div>

          {/* Marquee */}
          <Marquee className="rounded-2xl border border-border py-3">
            {['Free shipping over $75', '30-day returns', 'Carbon-neutral delivery'].map((t) => (
              <span key={t} className="mx-6 text-xs uppercase tracking-wider text-muted-foreground">{t}</span>
            ))}
          </Marquee>

          {/* Full-bleed Section tones */}
          <UiSection tone="gradient" rounded className="!py-8">
            <p className="font-serif text-xl">Section tone=gradient</p>
          </UiSection>
        </div>
      </Section>

      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        title="Example dialog"
        description="Modal with scrim, focus trap and Escape to close."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={() => setDialog(false)}>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Dialog body content goes here.</p>
      </Dialog>

      <Sheet open={sheet} onOpenChange={setSheet} title="Example sheet" description="Slides in from the right.">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Mail className="h-5 w-5" aria-hidden /> Drawer content
        </div>
      </Sheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
