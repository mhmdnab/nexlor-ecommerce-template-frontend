'use client';

import { Badge, Button, Eyebrow, GlassPanel, GradientText, Price, QuantityStepper, Reveal, Skeleton, cn, useToast } from '@repo/ui';
import { Check, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useCartUI } from '@/app/providers';
import { ProductGrid } from '@/components/ProductGrid';
import { useAddToCart, useProduct, useRelated } from '@/lib/queries';

export function ProductDetailView({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useProduct(slug);
  const related = useRelated(slug);
  const { openCart } = useCartUI();
  const { toast } = useToast();
  const add = useAddToCart();

  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  if (isLoading) return <PdpSkeleton />;
  if (isError || !product)
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed or is no longer available.</p>
      </div>
    );

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const displayPrice = selectedVariant?.price ?? product.price;

  async function addToCart() {
    const variant = selectedVariant ?? product!.variants.find((v) => v.inStock);
    if (!variant) return;
    if (!selectedVariant) setVariantId(variant.id);
    try {
      await add.mutateAsync({ variantId: variant.id, quantity: qty });
      toast({ title: 'Added to cart', description: `${product!.name} · ${variant.name}`, tone: 'success' });
      openCart();
    } catch (err) {
      toast({ title: 'Could not add to cart', description: (err as Error).message, tone: 'error' });
    }
  }

  const needsVariantChoice = product.variants.length > 1 && !selectedVariant;

  return (
    // Extra bottom padding on mobile so the sticky add-to-cart bar never covers content.
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* ───────────────────────── Gallery ───────────────────────── */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-3 sm:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    i === activeImage ? 'border-primary' : 'border-transparent hover:border-border-strong',
                  )}
                >
                  <Image src={img.url} alt={img.alt} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-xl bg-surface-sunken">
            {product.images[activeImage] && (
              <Image
                src={product.images[activeImage].url}
                alt={product.images[activeImage].alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-slow ease-standard group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            )}
          </div>
        </div>

        {/* ───────────────────────── Buy box ───────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.categories.length > 0 && (
            <Eyebrow>{product.categories.map((c) => c.name).join(' · ')}</Eyebrow>
          )}
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>

          {/* Gradient accent on the active price — sits on the plain light surface, contrast is fine. */}
          <p className="mt-4 flex items-center gap-3">
            <GradientText className="text-3xl font-semibold">
              <Price cents={displayPrice} />
            </GradientText>
            {product.variants.some((v) => v.inStock) ? (
              <Badge tone="success">In stock</Badge>
            ) : (
              <Badge tone="neutral">Sold out</Badge>
            )}
          </p>

          {/* Variant selector — clear selected / hover / disabled states */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Select option</span>
              {needsVariantChoice && <span className="text-sm text-danger">Required</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={!v.inStock}
                  aria-pressed={v.id === variantId}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    'min-h-11 rounded-lg border px-4 text-sm font-medium transition-[background-color,border-color,box-shadow,transform] duration-fast ease-standard',
                    'disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through disabled:hover:translate-y-0',
                    v.id === variantId
                      ? 'border-primary bg-accent text-accent-foreground shadow-sm'
                      : 'border-border-strong hover:-translate-y-0.5 hover:border-foreground hover:bg-surface-sunken',
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + add (desktop primary CTA) */}
          <div className="mt-8 flex items-center gap-4">
            <QuantityStepper value={qty} onChange={setQty} max={selectedVariant?.stock ?? 10} />
            <Button
              className="flex-1"
              size="lg"
              loading={add.isPending}
              disabled={needsVariantChoice}
              onClick={addToCart}
            >
              Add to cart
            </Button>
          </div>
          {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.inStock && (
            <p className="mt-3 text-sm text-warning">Only {selectedVariant.stock} left in stock.</p>
          )}

          {/* Reassurance */}
          <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Truck className="h-4 w-4" aria-hidden /> Free shipping over $75</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden /> Secure checkout</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4" aria-hidden /> 30-day easy returns</p>
          </div>

          {/* Description */}
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-semibold">Details</h2>
            <p className="mt-2 text-muted-foreground prose-measure">{product.description}</p>
          </div>
        </div>
      </div>

      {/* ───────────────────────── Related ───────────────────────── */}
      <Reveal as="section" className="mt-20">
        <Eyebrow>More to explore</Eyebrow>
        <h2 className="mb-6 mt-2 font-serif text-2xl font-semibold sm:text-3xl">
          You might also <GradientText>like</GradientText>
        </h2>
        <ProductGrid products={related.data} isLoading={related.isLoading} />
      </Reveal>

      {/* ─────────────── Mobile sticky add-to-cart bar ─────────────── */}
      <GlassPanel className="fixed inset-x-0 bottom-0 z-sticky border-t border-glass-border pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            {/* Solid foreground here: the glass overlay is not a plain light surface,
                so a gradient-clipped price would be thin on contrast. */}
            <Price cents={displayPrice} className="text-base font-semibold text-foreground" />
          </div>
          <Button
            className="ml-auto"
            size="lg"
            loading={add.isPending}
            disabled={needsVariantChoice}
            onClick={addToCart}
          >
            {needsVariantChoice ? 'Select option' : 'Add to cart'}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}

function PdpSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-8 h-11 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
