# Nexlor "Warm Luxe" Rebrand — Design Spec

**Date:** 2026-06-08
**Status:** Approved (brainstorm)
**Goal:** Give the Nexlor commerce template a fresh, distinctive visual identity for a
marketing video that sells the template as a product. The redesign must (a) look
unmistakably premium on camera and (b) reinforce the template's core selling point —
"rebrand the entire storefront + admin by editing one token file."

## Context

Nexlor is a Turborepo-style monorepo:

- `apps/storefront` — Next.js shopper-facing store (framer-motion, `@repo/ui`).
- `apps/admin` — Next.js management dashboard.
- `packages/ui` — shared design system. **`src/tokens/theme.css` is the single source
  of visual truth.** Colors are HSL channel triples consumed by Tailwind via
  `hsl(var(--token) / <alpha-value>)`. Changing `--primary` + a few tokens rebrands
  everything.
- Fonts are injected per-app via `next/font/google` as CSS variables `--font-sans`
  and `--font-serif`.

The template is already clean and well-architected. This is a **rebrand + polish**, not
a re-architecture. Direction chosen during brainstorm: **"Warm Luxe Minimal"** with
**Playfair Display + Hanken Grotesk** typography.

## Visual Direction

**Warm Luxe Minimal** — a refined evolution of the existing cream look. Warm cream
canvas, deep emerald primary, a sparingly-used gold accent (the signature touch), and a
high-contrast editorial serif. Photographs as timeless, expensive, boutique.

## 1. Token Layer — `packages/ui/src/tokens/theme.css`

This is the primary swap point. Representative target values (exact HSL tuned during
implementation; all values stay as HSL channel triples):

### Light (`:root`)

| Token | Current | Target (Warm Luxe) | Notes |
|---|---|---|---|
| `--background` | `40 33% 98%` | `40 38% 97%` | warmer cream |
| `--surface` | `0 0% 100%` | `40 40% 99%` | warm white |
| `--primary` | `243 75% 59%` | `159 56% 27%` | deep emerald |
| `--primary-hover` | indigo | emerald, ~6% darker | |
| `--primary-active` | indigo | emerald, ~12% darker | |
| `--accent` | `243 60% 96%` | emerald tint `158 40% 94%` | |
| `--accent-foreground` | `243 72% 45%` | emerald `159 56% 27%` | |
| `--gradient-from` | `var(--primary)` | `var(--primary)` (emerald) | unchanged mechanism |
| `--gradient-to` | `270 70% 60%` (violet) | **gold** `41 54% 54%` | emerald→gold brand gradient |
| `--foreground` | `28 12% 13%` | `30 22% 12%` | deeper warm ink |
| `--surface-inverse` | `250 24% 9%` (violet-black) | `160 28% 8%` (emerald-black) | cohesive dark bands |
| `--ring` | indigo | emerald | focus colour |

**New token:** `--gold: 41 54% 54%` (+ optionally `--gold-foreground`, `--gold-subtle`)
for the hairline rules, "Sale" tags, and dividers. Wire it into the Tailwind preset so
`text-gold` / `bg-gold` / `border-gold` exist.

### Dark (`.dark`)

Re-tune tonally (NOT a naive invert), keeping the design philosophy already in the file:

- `--background` → warm charcoal (e.g. `30 9% 8%`, retain warmth).
- `--primary` → lightened emerald (e.g. `158 52% 52%`) with dark `--primary-foreground`.
- `--gradient-to` → lighter gold (e.g. `41 60% 64%`).
- `--surface-inverse` → deep emerald-charcoal.
- `--ring` → lightened emerald.

The in-video theme toggle must look intentional in both modes.

### Tailwind preset

`packages/ui/tailwind-preset` (consumed by both apps' `tailwind.config.ts`) must expose
the new `gold` token family. No structural changes to the preset otherwise.

## 2. Typography

Swap font wiring in **both** `apps/storefront/src/app/layout.tsx` and
`apps/admin/src/app/layout.tsx`:

- **Display/serif → Playfair Display** (replaces Fraunces), variable `--font-serif`,
  weights 500/600/700. **Remove `axes: ['opsz']`** — Playfair has no optical-size axis.
- **Body/sans → Hanken Grotesk** (replaces Inter), variable `--font-sans`.
- **Admin** currently ships sans-only — add the Playfair `--font-serif` variable so admin
  page titles can use the editorial headline.
- Update `--font-serif-fallback` / `--font-sans-fallback` in `theme.css`.
- Retune `.font-display` in each app's `globals.css`: Playfair's higher stroke contrast
  wants slightly larger size and tighter leading than Fraunces to read luxe.

**No new dependencies** — both fonts ship via `next/font/google`.

## 3. Storefront Component Polish

All changes use tokens — no hard-coded hex. Files under `apps/storefront/src`.

- **Hero** (`app/page.tsx`) — emerald→gold glow blobs, Playfair headline, a **gold
  hairline rule** introducing the value-props, emerald solid primary button, refined
  secondary.
- **Product cards** (`components/ProductCard.tsx`) — quieter borders, emerald "New" /
  gold "Sale" tags, refined hover lift, Playfair product names.
- **Bento / category grid** (`app/page.tsx`) — warmer image overlays, promo tile using
  the emerald→gold gradient.
- **Editorial dark band** (`components/`/`app/page.tsx` `Section tone="inverse"`) —
  emerald-black surface, gold eyebrow accent.
- **Marquee + dividers** — gold hairline treatment.

## 4. Admin Component Polish

Files under `apps/admin/src`.

- **Sidebar / Topbar** (`components/Sidebar.tsx`, `components/Topbar.tsx`) — emerald
  active states, gold accent on the logo/active section, Playfair section headings.
- **Dashboard** (`app/(dashboard)/page.tsx`, `components/RevenueChart.tsx`) — recolor the
  revenue chart (emerald primary series + gold secondary), refined stat cards.
- Tables, forms, badges (`@repo/ui` `DataTable`, `Field`, `StatusBadge`) inherit the
  token swap automatically; tune only the few spots referencing `primary`/`accent`
  directly.

## 5. Motion & Depth

- Slightly richer hero parallax and a gentle staggered `Reveal` cadence on first paint
  (already globally reduced-motion-guarded via `MotionConfig`).
- Light elevation pass leaning on the existing emerald-tinted `--shadow-glow` so cards
  feel seated on warm paper.

## 6. New Homepage Sections

Added to `apps/storefront/src/app/page.tsx`, composed from existing `@repo/ui`
primitives (`Section`, `Reveal`, `Marquee`, `Card`, `GradientText`, `Eyebrow`) — **no new
component library**. Final section order:

1. Hero *(reworked)*
2. Shop by category — bento *(reworked)*
3. **Brand values trio** *(new)* — three gold-accented columns with refined Lucide icons
   (e.g. Sustainably sourced · Crafted to last · Carbon-neutral).
4. New arrivals product rail *(reworked)*
5. **Lookbook editorial** *(new)* — full-bleed image + Playfair caption + gold rule;
   primary B-roll moment.
6. Editorial dark band *(reworked → emerald-black)*
7. **Testimonials / press** *(new)* — customer quote row / press logos for social proof.
8. **Newsletter CTA band** *(new)* — emerald→gold closing band with email capture;
   doubles as the video end-card. (Visual only — no backend submission wiring.)
9. Value marquee *(reworked → gold hairlines)*

New sections may live inline in `page.tsx` or as small components under
`apps/storefront/src/components/home/` if `page.tsx` grows too large — extract when a
section exceeds a comfortable size, following existing patterns.

## Non-Goals (YAGNI)

- No backend / API / Prisma changes.
- No new admin pages or routes.
- No new runtime dependencies beyond the two Google fonts (via `next/font`).
- No restructured app architecture or routing.
- Newsletter form is presentational (no email backend).

## Success Criteria

- Editing only `theme.css` (+ the two `layout.tsx` font lines) visibly rebrands both apps
  to Warm Luxe — the "one-file rebrand" story is demonstrably true on camera.
- Storefront homepage reads as a premium boutique: Playfair headlines, emerald CTAs, gold
  hairline accents, the four new sections flowing as an editorial narrative.
- Admin dashboard is recolored and refined enough to be a selling point on video.
- Light **and** dark modes both look intentional; the theme toggle is a clean demo beat.
- No hard-coded colors introduced; all visuals reference tokens.
- Reduced-motion and keyboard-focus behavior preserved.
