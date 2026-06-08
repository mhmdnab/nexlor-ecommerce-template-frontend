# Warm Luxe Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the Nexlor storefront + admin to a "Warm Luxe" identity (emerald + gold on warm cream, Playfair Display + Hanken Grotesk) and add four new editorial homepage sections, so the template looks premium on camera for a product marketing video.

**Architecture:** All color/typography flows from one token file (`packages/ui/src/tokens/theme.css`) consumed by a shared Tailwind preset. Changing tokens + two `layout.tsx` font lines rebrands both apps. New homepage sections are small self-contained components composed from existing `@repo/ui` primitives. No backend, no new pages, no new runtime deps beyond two Google fonts.

**Tech Stack:** Next.js (App Router), Tailwind CSS (token-driven preset), `next/font/google`, framer-motion, `@repo/ui` design system. No unit-test runner — verification gates are `npm run typecheck`, `npm run lint`, `npm run build`, plus dev-server visual review.

**Spec:** `docs/superpowers/specs/2026-06-08-warm-luxe-rebrand-design.md`

**Branch:** `design/warm-luxe-rebrand` (already created).

**Working directory for all commands:** `nexlor-ecommerce-template-frontend/` (the frontend repo root).

---

## Verification Conventions

This is visual work. Each task ends with the same three gates unless noted:

1. **Typecheck:** `npm run typecheck` → Expected: no errors.
2. **Lint:** `npm run lint` → Expected: no new errors/warnings introduced.
3. **Visual check:** with `npm run dev` running, open the affected page in the browser, confirm the described look in **both light and dark** mode (toggle via the storefront `ThemeToggle` in the header; for admin use the topbar toggle). Confirm keyboard focus rings are still visible and `prefers-reduced-motion` still calms motion (OS setting).

Then commit. Keep `npm run dev` running in a separate terminal throughout.

---

## Task 1: Rebrand the token layer (light + dark + gold)

**Files:**
- Modify: `packages/ui/src/tokens/theme.css`

- [ ] **Step 1: Replace the light `:root` brand/surface/text tokens**

In `packages/ui/src/tokens/theme.css`, inside `:root`, replace the existing values for these tokens (keep every other token as-is). Set:

```css
  /* ---- surfaces ---- */
  --background: 40 38% 97%;
  --surface: 40 40% 99%;
  --surface-raised: 40 30% 99%;
  --surface-sunken: 40 24% 94%;

  /* ---- lines ---- */
  --border: 38 20% 86%;
  --border-strong: 36 16% 72%;
  --divider: 40 22% 90%;

  /* ---- text ---- */
  --foreground: 30 22% 12%;
  --muted-foreground: 30 10% 34%;
  --subtle-foreground: 32 8% 50%;

  /* ---- brand (deep emerald) ---- */
  --primary: 159 56% 27%;
  --primary-foreground: 40 40% 98%;
  --primary-hover: 159 58% 23%;
  --primary-active: 159 60% 19%;

  --accent: 158 40% 94%;
  --accent-foreground: 159 56% 27%;

  /* ---- gold accent (signature; hairlines, sale tags, dividers) ---- */
  --gold: 41 54% 50%;
  --gold-foreground: 30 22% 12%;
  --gold-subtle: 41 60% 92%;

  /* ---- brand gradient: emerald -> gold ---- */
  --gradient-from: var(--primary);
  --gradient-to: 41 54% 52%;
```

(The `--gradient-brand` / `--gradient-brand-soft` lines that build the `linear-gradient(...)` stay unchanged — they already reference `--gradient-from`/`--gradient-to`.)

- [ ] **Step 2: Replace the light inverse + glass tokens**

Still in `:root`, set:

```css
  /* ---- inverse "drama" surface (emerald-black bands) ---- */
  --surface-inverse: 162 30% 9%;
  --surface-inverse-foreground: 40 30% 95%;
  --surface-inverse-muted: 150 8% 66%;
  --surface-inverse-border: 160 16% 22%;

  /* ---- glass (mirrors --background) ---- */
  --glass-tint: 40 38% 97%;
  --glass-border: 38 20% 86%;
```

And set focus ring to emerald:

```css
  --ring: 159 56% 27%;
```

- [ ] **Step 3: Update the serif/sans fallbacks**

Still in `:root`, replace the two fallback lines:

```css
  --font-sans-fallback: 'Hanken Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-serif-fallback: 'Playfair Display', ui-serif, Georgia, 'Times New Roman', serif;
```

- [ ] **Step 4: Re-tune the dark `.dark` block tonally**

In the `.dark` block, replace these tokens (leave the rest):

```css
  --background: 30 9% 8%;
  --surface: 30 8% 11%;
  --surface-raised: 30 8% 14%;
  --surface-sunken: 30 10% 6%;

  --foreground: 40 22% 95%;
  --muted-foreground: 38 9% 68%;
  --subtle-foreground: 36 7% 50%;

  --primary: 158 52% 52%;
  --primary-foreground: 160 40% 8%;
  --primary-hover: 158 52% 58%;
  --primary-active: 158 52% 46%;

  --accent: 160 30% 18%;
  --accent-foreground: 158 60% 74%;

  --gold: 41 60% 60%;
  --gold-foreground: 40 30% 8%;
  --gold-subtle: 41 30% 18%;

  --gradient-from: var(--primary);
  --gradient-to: 41 64% 64%;

  --surface-inverse: 162 22% 12%;
  --surface-inverse-foreground: 40 30% 95%;
  --surface-inverse-muted: 150 8% 68%;
  --surface-inverse-border: 160 14% 28%;

  --ring: 158 52% 52%;
```

- [ ] **Step 5: Verify the token swap compiles and recolors**

Run `npm run typecheck` → Expected: no errors (CSS isn't typechecked, but this confirms nothing else broke). Then with `npm run dev` running, open the storefront homepage. Expected: cream canvas, emerald buttons, emerald-black editorial band. Toggle dark mode → warm charcoal + lighter emerald. Note: gold isn't visibly used yet (added to the preset next) — that's fine.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/tokens/theme.css
git commit -m "feat(ui): rebrand tokens to Warm Luxe (emerald + gold on cream)"
```

---

## Task 2: Expose the gold token in the Tailwind preset

**Files:**
- Modify: `packages/ui/src/tailwind-preset.ts`

- [ ] **Step 1: Add the `gold` color family**

In `packages/ui/src/tailwind-preset.ts`, inside `theme.extend.colors`, add a `gold` entry directly after the `accent` line (around line 33):

```ts
        accent: { DEFAULT: c('accent'), foreground: c('accent-foreground') },
        gold: { DEFAULT: c('gold'), foreground: c('gold-foreground'), subtle: c('gold-subtle') },
```

- [ ] **Step 2: Verify the utilities generate**

Run `npm run typecheck` → Expected: no errors. With dev running, temporarily confirm a gold utility resolves by checking the styleguide page if present (`apps/admin` `/styleguide`) or trust the next task's usage. Expected: `text-gold`, `bg-gold`, `border-gold`, `bg-gold-subtle` are now valid classes.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/tailwind-preset.ts
git commit -m "feat(ui): add gold accent color to tailwind preset"
```

---

## Task 3: Swap fonts to Playfair Display + Hanken Grotesk

**Files:**
- Modify: `apps/storefront/src/app/layout.tsx`
- Modify: `apps/admin/src/app/layout.tsx`
- Modify: `apps/storefront/src/app/globals.css`

- [ ] **Step 1: Rewire storefront fonts**

In `apps/storefront/src/app/layout.tsx`, replace the font import + declarations (lines ~3-17). Replace:

```tsx
import { Fraunces, Inter } from 'next/font/google';
```
with:
```tsx
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
```

Replace the two `const inter = ...` / `const fraunces = ...` blocks with:

```tsx
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['500', '600', '700'],
});
```

Update the `<html className=...>` (line ~28) to:

```tsx
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
```

- [ ] **Step 2: Rewire admin fonts (add serif)**

In `apps/admin/src/app/layout.tsx`, replace:

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
```
with:
```tsx
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['500', '600', '700'],
});
```

Update the `<html>` element:

```tsx
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
```

- [ ] **Step 3: Retune `.font-display` for Playfair**

In `apps/storefront/src/app/globals.css`, replace the `.font-display` rule body with:

```css
.font-display {
  font-family: var(--font-serif, var(--font-serif-fallback));
  font-size: clamp(2.75rem, 6.5vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.015em;
  font-weight: 600;
}
```

- [ ] **Step 4: Verify fonts load**

Run `npm run typecheck` → Expected: no errors. Restart `npm run dev` (font changes need a dev restart). Open storefront homepage. Expected: hero headline now renders in Playfair Display (high-contrast serif), body text in Hanken Grotesk. Open admin (`/login` or dashboard) → body is Hanken Grotesk. No Fraunces/Inter remaining.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/src/app/layout.tsx apps/admin/src/app/layout.tsx apps/storefront/src/app/globals.css
git commit -m "feat: swap fonts to Playfair Display + Hanken Grotesk"
```

---

## Task 4: Rework the storefront hero

**Files:**
- Modify: `apps/storefront/src/app/page.tsx` (hero `<section>`, lines ~45-101)

- [ ] **Step 1: Add a gold hairline under the hero CTAs**

In the hero `Reveal` containing the buttons (around line 73-98), after the closing `</div>` of the button row but still inside that `Reveal`, add a gold hairline + microcopy. Insert immediately after the buttons' wrapping `<div>` closes:

```tsx
              <div className="mt-10 flex items-center gap-3">
                <span className="h-px w-12 bg-gold" aria-hidden />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-surface-inverse-muted">
                  Crafted to last · 30-day returns · Carbon-neutral
                </span>
              </div>
```

- [ ] **Step 2: Warm the second glow blob to gold**

In the hero, the second decorative blob (around line 53-56) currently uses `bg-gradient-brand`. Change that element's class so the lower-left blob reads gold:

```tsx
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-gold opacity-20 blur-3xl"
          />
```

(Leave the top-right `motion.div` blob on `bg-gradient-brand` — emerald→gold gradient now.)

- [ ] **Step 3: Verify the hero**

Run `npm run typecheck` and `npm run lint` → Expected: no errors. Visual: hero shows Playfair headline, emerald primary button, a gold hairline rule with microcopy, an emerald-gradient glow top-right and a soft gold glow bottom-left. Check dark mode and focus rings.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/src/app/page.tsx
git commit -m "feat(storefront): rework hero with gold hairline and accents"
```

---

## Task 5: Polish the product card

**Files:**
- Modify: `apps/storefront/src/components/ProductCard.tsx`

- [ ] **Step 1: Make the product name use the serif display face**

In `ProductCard.tsx`, change the `<h3>` (line ~76) to use the serif family and slightly larger size:

```tsx
        <h3 className="font-serif text-base font-medium leading-snug text-foreground">{product.name}</h3>
```

- [ ] **Step 2: Add a gold "Sale" badge slot**

The card already renders `New` / `Low stock` / `Sold out` badges (lines ~51-55). Add a gold sale indicator using the new token. Replace the badge stack block with:

```tsx
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {!product.inStock && <Badge tone="neutral">Sold out</Badge>}
          {product.inStock && product.lowStock && <Badge tone="warning">Low stock</Badge>}
          {product.inStock && product.isNew && !product.lowStock && <Badge tone="primary">New</Badge>}
          {product.inStock && product.onSale && !product.isNew && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-foreground">
              Sale
            </span>
          )}
        </div>
```

NOTE: only keep the `onSale` block if `ProductCardType` has an `onSale`/discount field. Verify first: open `packages/types` and check the `ProductCard` type. If there is no sale/discount field, OMIT the `onSale` block entirely (do not invent a field) and keep the other three badges. The serif name change in Step 1 is the required part of this task.

- [ ] **Step 3: Verify**

Run `npm run typecheck` → Expected: no errors (if `onSale` doesn't exist and you left it in, typecheck will fail — remove it). Visual: product names render in Playfair; badges sit top-left; hover lift + quick-add still work.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/src/components/ProductCard.tsx
git commit -m "feat(storefront): serif product names + gold sale badge"
```

---

## Task 6: Add four new homepage section components

Build each as a self-contained component under a new `home/` folder. They use only existing `@repo/ui` exports (`Eyebrow`, `GradientText`, `Reveal`, `Section`) plus `lucide-react` icons and `next/image`.

**Files:**
- Create: `apps/storefront/src/components/home/ValuesTrio.tsx`
- Create: `apps/storefront/src/components/home/Lookbook.tsx`
- Create: `apps/storefront/src/components/home/Testimonials.tsx`
- Create: `apps/storefront/src/components/home/NewsletterBand.tsx`

- [ ] **Step 1: Create `ValuesTrio.tsx`**

```tsx
import { Eyebrow, Reveal } from '@repo/ui';
import { Leaf, Hammer, Truck } from 'lucide-react';

const VALUES = [
  {
    icon: Leaf,
    title: 'Sustainably sourced',
    body: 'Materials chosen for longevity and a lighter footprint — never fast fashion.',
  },
  {
    icon: Hammer,
    title: 'Crafted to last',
    body: 'Made by people who care, with details that hold up to everyday life.',
  },
  {
    icon: Truck,
    title: 'Carbon-neutral delivery',
    body: 'Every order ships carbon-neutral, with 30-day no-questions returns.',
  },
];

export function ValuesTrio() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 text-center">
        <Eyebrow>Why Nexlor</Eyebrow>
        <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Made with intention
        </h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delayIndex={i}>
            <div className="flex flex-col items-center px-4 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-subtle text-gold">
                <v.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-serif text-xl font-semibold text-foreground">{v.title}</h3>
              <span className="mt-3 h-px w-8 bg-gold" aria-hidden />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `Lookbook.tsx`**

```tsx
import { buttonVariants, cn, Eyebrow, Reveal } from '@repo/ui';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Lookbook() {
  return (
    <section className="py-16 sm:py-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl">
          <Image
            src="https://picsum.photos/seed/nx-lookbook/1600/900"
            alt="The 2026 lookbook — considered essentials, photographed in natural light"
            width={1600}
            height={900}
            sizes="100vw"
            className="h-[60vh] min-h-[24rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-14">
            <Eyebrow className="text-white/80">The 2026 lookbook</Eyebrow>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-12 bg-gold" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                Editorial
              </span>
            </div>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold text-white sm:text-5xl">
              Light, texture, and things worth keeping.
            </h2>
            <p className="mt-4 max-w-md text-base text-white/80">
              A season of quiet essentials, photographed the way they’re meant to be lived in.
            </p>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mt-8 w-fit bg-surface text-foreground shadow-sm hover:bg-surface-sunken',
              )}
            >
              Explore the lookbook
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 3: Create `Testimonials.tsx`**

```tsx
import { Eyebrow, Reveal } from '@repo/ui';
import { Star } from 'lucide-react';

const QUOTES = [
  {
    quote: 'The quality is genuinely exceptional. Everything I’ve bought has become a staple.',
    name: 'Amara O.',
    detail: 'Verified buyer',
  },
  {
    quote: 'Beautifully made and it arrived faster than I expected. The packaging alone felt premium.',
    name: 'Daniel R.',
    detail: 'Verified buyer',
  },
  {
    quote: 'I keep coming back. Timeless pieces that don’t go out of style — exactly what I wanted.',
    name: 'Priya S.',
    detail: 'Verified buyer',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 text-center">
        <Eyebrow>Loved by customers</Eyebrow>
        <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Worn, kept, recommended
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delayIndex={i}>
            <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex gap-0.5 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed text-foreground">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-medium text-foreground">{q.name}</span>
                <span className="text-muted-foreground"> · {q.detail}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `NewsletterBand.tsx`**

This is presentational only (no backend submission) per the spec — the form prevents default and shows nothing dynamic.

```tsx
'use client';

import { buttonVariants, cn, Eyebrow } from '@repo/ui';

export function NewsletterBand() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-brand px-6 py-16 text-center sm:px-10">
        <div className="relative z-10 mx-auto max-w-xl">
          <Eyebrow className="text-primary-foreground/80">Stay in the loop</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary-foreground sm:text-4xl">
            First access to new arrivals
          </h2>
          <p className="mt-3 text-primary-foreground/85">
            Join the list for early drops, restocks, and the occasional members-only offer.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-full bg-surface px-5 text-sm text-foreground shadow-sm outline-none placeholder:text-subtle-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-foreground text-background hover:opacity-90',
              )}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Verify the components compile in isolation**

Run `npm run typecheck` → Expected: no errors. (The components aren't rendered yet; this confirms imports/types are valid.) If `Eyebrow` or `Reveal` import paths error, check `packages/ui/src/index.ts` for the exact export name and fix the import.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/components/home/
git commit -m "feat(storefront): add Values, Lookbook, Testimonials, Newsletter sections"
```

---

## Task 7: Assemble new sections into the homepage

**Files:**
- Modify: `apps/storefront/src/app/page.tsx`

- [ ] **Step 1: Import the new sections**

At the top of `page.tsx`, after the existing `import { ProductGrid } ...` line, add:

```tsx
import { ValuesTrio } from '@/components/home/ValuesTrio';
import { Lookbook } from '@/components/home/Lookbook';
import { Testimonials } from '@/components/home/Testimonials';
import { NewsletterBand } from '@/components/home/NewsletterBand';
```

- [ ] **Step 2: Place `ValuesTrio` between the bento section and the product rail**

Inside the `<div className="mx-auto max-w-7xl ...">` wrapper, between the closing `</section>` of the bento "Shop by category" block and the opening of the "PRODUCT RAIL — New arrivals" `<section>`, insert:

```tsx
        <ValuesTrio />
```

- [ ] **Step 3: Place `Lookbook` after the product rail (still inside the max-w-7xl wrapper)**

Immediately after the New arrivals `</section>` (before the wrapper `</div>` closes), insert:

```tsx
        <Lookbook />
```

- [ ] **Step 4: Place `Testimonials` and `NewsletterBand` after the editorial band**

The existing editorial `<Section tone="inverse" rounded>...</Section>` sits after the max-w-7xl wrapper. After that `</Section>` and before the value Marquee `<div>`, insert a max-width wrapper for testimonials, then the full-bleed newsletter band:

```tsx
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Testimonials />
      </div>
      <NewsletterBand />
```

The final on-page order must be: Hero → Bento → ValuesTrio → New arrivals → Lookbook → Editorial band → Testimonials → NewsletterBand → Value marquee.

- [ ] **Step 5: Verify the full homepage**

Run `npm run typecheck` and `npm run lint` → Expected: no errors. Visual: scroll the whole homepage. Confirm the section order above, gold accents appear (values icons, hairlines, stars, sale badges), Playfair headings throughout, and the newsletter band shows the emerald→gold gradient. Check dark mode top-to-bottom and tab through interactive elements for focus rings.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/app/page.tsx
git commit -m "feat(storefront): assemble new editorial homepage sections"
```

---

## Task 8: Polish the admin shell (sidebar, topbar, headings)

**Files:**
- Modify: `apps/admin/src/components/Sidebar.tsx`
- Modify: `apps/admin/src/components/Topbar.tsx`

- [ ] **Step 1: Read both files first**

Open `apps/admin/src/components/Sidebar.tsx` and `apps/admin/src/components/Topbar.tsx` to see the current markup and class usage before editing. Do not guess class names.

- [ ] **Step 2: Make the active nav state emerald + add gold logo accent (Sidebar)**

In `Sidebar.tsx`: ensure the active link/state uses primary tokens (e.g. `bg-accent text-accent-foreground` for the active item, `text-primary` for the active icon). If the brand/logo wordmark is present, give it the serif face and a gold accent dot: wrap or adjust the logo to use `font-serif` and add an adjacent `<span className="text-gold">·</span>` or a `bg-gold` dot. Keep all colors token-based — replace any hard-coded grays with `text-muted-foreground` / `border-border` if encountered.

- [ ] **Step 3: Serif section/page heading (Topbar)**

In `Topbar.tsx`: if it renders the current page title, give that title `font-serif` so admin headings match the storefront editorial treatment. Keep size/weight as-is otherwise.

- [ ] **Step 4: Verify the admin shell**

Run `npm run typecheck` and `npm run lint` → Expected: no errors. Visual: open the admin dashboard. Confirm active nav item reads emerald, the logo has a gold accent + serif, page title is serif. Check dark mode.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/components/Sidebar.tsx apps/admin/src/components/Topbar.tsx
git commit -m "feat(admin): emerald active nav, gold logo accent, serif headings"
```

---

## Task 9: Recolor the admin dashboard chart + stat cards

**Files:**
- Modify: `apps/admin/src/components/RevenueChart.tsx`
- Modify: `apps/admin/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Read both files first**

Open `RevenueChart.tsx` to find where the series color is defined (it may use a hard-coded hex, a CSS var, or `currentColor`). Open the dashboard `page.tsx` to find the stat cards.

- [ ] **Step 2: Point the chart series at the emerald primary token**

In `RevenueChart.tsx`: replace the primary series color with the emerald token. If the chart reads a CSS variable, use `hsl(var(--primary))`; if it takes a prop/constant hex, set it to read from the token via `hsl(var(--primary))` (and a secondary series, if any, to `hsl(var(--gold))`). If the library needs a concrete color string, prefer `'hsl(var(--primary))'`. Do not introduce a raw hex — keep it token-driven so the chart rebrands with the theme.

- [ ] **Step 3: Add a subtle gold accent to one stat card (optional polish)**

In the dashboard `page.tsx`, if stat cards exist, give the primary KPI card a thin gold top rule or a `text-gold` trend indicator using existing markup (e.g. add `border-t-2 border-gold` to the lead card, or color a positive delta `text-success`). Keep it restrained — one accent, not all four.

- [ ] **Step 4: Verify the dashboard**

Run `npm run typecheck` and `npm run lint` → Expected: no errors. Visual: open the dashboard. Chart renders emerald (and gold secondary if applicable); it recolors correctly in dark mode (toggle and confirm the line is the lighter emerald). Stat cards look intentional.

- [ ] **Step 5: Commit**

```bash
git add "apps/admin/src/components/RevenueChart.tsx" "apps/admin/src/app/(dashboard)/page.tsx"
git commit -m "feat(admin): emerald revenue chart + gold stat accent"
```

---

## Task 10: Full verification pass + final build

**Files:** none (verification only)

- [ ] **Step 1: Typecheck everything**

Run `npm run typecheck` → Expected: no errors across all workspaces.

- [ ] **Step 2: Lint everything**

Run `npm run lint` → Expected: no errors in storefront or admin.

- [ ] **Step 3: Production build**

Run `npm run build` → Expected: both `@nexlor/storefront` and `@nexlor/admin` build successfully with no errors.

- [ ] **Step 4: The "one-file rebrand" demo check**

Confirm the core selling point is true on camera: open `packages/ui/src/tokens/theme.css`, change `--primary` to a different hue (e.g. `25 80% 45%` burnt orange), save, and watch both the running storefront and admin recolor live. Then revert `--primary` back to `159 56% 27%`. Expected: a single token edit visibly rebrands both apps — this is the hero demo beat for the video.

- [ ] **Step 5: Final visual walkthrough (light + dark)**

Storefront: hero, bento, values trio, new arrivals, lookbook, editorial band, testimonials, newsletter, marquee. Admin: dashboard, products table, a form. Confirm: no indigo/violet remnants, gold used sparingly as an accent (not overused), Playfair headings everywhere, focus rings visible, reduced-motion respected.

- [ ] **Step 6: Commit any final tweaks**

If the walkthrough surfaced small fixes, make them and commit:

```bash
git add -A
git commit -m "polish: final Warm Luxe visual pass"
```

---

## Self-Review Notes (for the planner)

- **Spec coverage:** Tokens (T1), gold in preset (T2), typography incl. admin serif + `.font-display` (T3), hero (T4), product cards (T5), four new sections (T6-T7), admin shell (T8), admin dashboard/chart (T9), motion/depth handled via existing `Reveal`/`shadow-glow` exercised in T4/T6, full verification incl. one-file-rebrand success criterion (T10). All spec sections map to a task.
- **Conditional guard:** T5 `onSale` field is explicitly gated on verifying `ProductCardType` to avoid referencing an undefined property.
- **Token names** used in components (`bg-gold`, `text-gold`, `bg-gold-subtle`, `text-gold-foreground`) all match the families defined in T1 (`--gold`, `--gold-foreground`, `--gold-subtle`) and exposed in T2.
- **No backend / new deps:** newsletter form is `preventDefault`-only; fonts via `next/font/google`.
