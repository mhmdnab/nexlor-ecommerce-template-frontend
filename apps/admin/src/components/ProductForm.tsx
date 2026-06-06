'use client';

import { ProductStatus, type ProductDetail } from '@repo/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Checkbox,
  Field,
  Input,
  Label,
  Select,
  Textarea,
  buttonVariants,
  cn,
  useToast,
} from '@repo/ui';
import {
  FolderOpen,
  GripVertical,
  ImagePlus,
  Layers,
  Package,
  Plus,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAdminCategories, usePresignUpload, useSaveProduct } from '@/lib/queries';

interface VariantDraft {
  id?: string;
  name: string;
  sku: string;
  price: string; // dollars; '' = use base price
  stock: string;
}
interface ImageDraft {
  id?: string;
  url: string;
  alt: string;
}

const centsToDollars = (c: number) => (c / 100).toFixed(2);
const dollarsToCents = (d: string) => Math.round(parseFloat(d || '0') * 100);

export function ProductForm({ product }: { product?: ProductDetail }) {
  const router = useRouter();
  const { toast } = useToast();
  const save = useSaveProduct();
  const presign = usePresignUpload();
  const { data: categories } = useAdminCategories();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [basePrice, setBasePrice] = useState(product ? centsToDollars(product.basePrice) : '');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? ProductStatus.DRAFT);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    product?.categories.map((c) => c.id) ?? [],
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.priceOverride != null ? centsToDollars(v.priceOverride) : '',
      stock: String(v.stock),
    })) ?? [{ name: 'Default', sku: '', price: '', stock: '0' }],
  );
  const [images, setImages] = useState<ImageDraft[]>(
    product?.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })) ?? [],
  );
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const touch = () => setDirty(true);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!basePrice || isNaN(parseFloat(basePrice))) e.basePrice = 'Enter a base price.';
    if (variants.length === 0) e.variants = 'Add at least one variant.';
    variants.forEach((v, i) => {
      if (!v.name.trim() || !v.sku.trim()) e[`variant-${i}`] = 'Name and SKU are required.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) {
      toast({ title: 'Please fix the highlighted fields', tone: 'error' });
      return;
    }
    const body = {
      name,
      slug: slug || undefined,
      description,
      basePrice: dollarsToCents(basePrice),
      status,
      categoryIds,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        priceOverride: v.price ? dollarsToCents(v.price) : null,
        stock: parseInt(v.stock || '0', 10),
      })),
      images: images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
    };
    try {
      await save.mutateAsync({ id: product?.id, body });
      toast({ title: product ? 'Product saved' : 'Product created', tone: 'success' });
      setDirty(false);
      router.push('/products');
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, tone: 'error' });
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      try {
        const { uploadUrl, publicUrl } = await presign.mutateAsync({
          filename: file.name,
          contentType: file.type,
        });
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        setImages((prev) => [...prev, { url: publicUrl, alt: name }]);
        touch();
      } catch {
        toast({
          title: 'Upload unavailable',
          description: "R2 storage isn’t configured. Add an image URL below instead.",
          tone: 'error',
        });
      }
    }
  }

  function reorder(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    touch();
  }

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          Products
        </Link>
        <span className="text-subtle-foreground">/</span>
        <span className="font-medium">{product ? product.name : 'New product'}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Main column ── */}
        <div className="space-y-6">

          {/* Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Details</CardTitle>
              </div>
              <CardDescription>Product name, URL slug, and description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Name" required error={errors.name}>
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    value={name}
                    invalid={invalid}
                    aria-describedby={describedBy}
                    onChange={(e) => {
                      setName(e.target.value);
                      touch();
                    }}
                  />
                )}
              </Field>
              <Field
                label="Slug"
                helper="Leave blank to auto-generate from the name."
              >
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    value={slug}
                    placeholder="auto"
                    aria-describedby={describedBy}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      touch();
                    }}
                  />
                )}
              </Field>
              <Field label="Description">
                {({ id }) => (
                  <Textarea
                    id={id}
                    value={description}
                    rows={5}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      touch();
                    }}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <CardTitle>Variants</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setVariants((v) => [...v, { name: '', sku: '', price: '', stock: '0' }]);
                    touch();
                  }}
                >
                  <Plus className="h-4 w-4" aria-hidden /> Add variant
                </Button>
              </div>
              <CardDescription>
                Each variant has its own SKU and stock level. Leave price blank to inherit the
                base price.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid grid-cols-[1fr_1fr_90px_70px_auto] items-end gap-2',
                    errors[`variant-${i}`] && 'rounded-md border border-danger/40 p-2',
                  )}
                >
                  <Field label={i === 0 ? 'Name' : ''} error={errors[`variant-${i}`]}>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={v.name}
                        placeholder="Size / color"
                        onChange={(e) => {
                          setVariants((p) =>
                            p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                          );
                          touch();
                        }}
                      />
                    )}
                  </Field>
                  <Field label={i === 0 ? 'SKU' : ''}>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={v.sku}
                        placeholder="SKU-001"
                        className="tabular"
                        onChange={(e) => {
                          setVariants((p) =>
                            p.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)),
                          );
                          touch();
                        }}
                      />
                    )}
                  </Field>
                  <Field label={i === 0 ? 'Price' : ''}>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={v.price}
                        placeholder="base"
                        inputMode="decimal"
                        className="tabular"
                        onChange={(e) => {
                          setVariants((p) =>
                            p.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)),
                          );
                          touch();
                        }}
                      />
                    )}
                  </Field>
                  <Field label={i === 0 ? 'Stock' : ''}>
                    {({ id }) => (
                      <Input
                        id={id}
                        value={v.stock}
                        inputMode="numeric"
                        className="tabular"
                        onChange={(e) => {
                          setVariants((p) =>
                            p.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)),
                          );
                          touch();
                        }}
                      />
                    )}
                  </Field>
                  <button
                    type="button"
                    aria-label="Remove variant"
                    onClick={() => {
                      setVariants((p) => p.filter((_, j) => j !== i));
                      touch();
                    }}
                    className="mb-1 grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-danger focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
              {errors.variants && (
                <p role="alert" className="text-sm text-danger">
                  {errors.variants}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Images / Media */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <CardTitle>Media</CardTitle>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => onFiles(e.target.files)}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={presign.isPending}
                    onClick={() => fileInput.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden /> Upload
                  </Button>
                </div>
              </div>
              <CardDescription>
                Drag to reorder. The first image is used as the primary product image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {images.length === 0 ? (
                <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No images yet. Upload (requires R2) or add a URL below.
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {images.map((img, i) => (
                    <li
                      key={img.id ?? img.url}
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
                        setDragIndex(null);
                      }}
                      className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface-sunken"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          <Star className="h-3 w-3" aria-hidden /> Primary
                        </span>
                      )}
                      <span className="absolute right-1 top-1 grid h-6 w-6 cursor-grab place-items-center rounded bg-black/60 text-white opacity-0 group-hover:opacity-100">
                        <GripVertical className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => {
                          setImages((p) => p.filter((_, j) => j !== i));
                          touch();
                        }}
                        className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded bg-danger p-1 text-danger-foreground opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <AddImageByUrl
                onAdd={(url) => {
                  setImages((p) => [...p, { url, alt: name }]);
                  touch();
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar column ── */}
        <div className="space-y-6">

          {/* Status & Price */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Status &amp; pricing</CardTitle>
              </div>
              <CardDescription>
                Publish status and base price. Totals are server-computed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Status">
                {({ id }) => (
                  <Select
                    id={id}
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as ProductStatus);
                      touch();
                    }}
                  >
                    <option value={ProductStatus.DRAFT}>Draft</option>
                    <option value={ProductStatus.ACTIVE}>Active</option>
                    <option value={ProductStatus.ARCHIVED}>Archived</option>
                  </Select>
                )}
              </Field>
              <Field
                label="Base price (USD)"
                required
                helper="Override per-variant with the price column above."
                error={errors.basePrice}
              >
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    value={basePrice}
                    invalid={invalid}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="tabular"
                    aria-describedby={describedBy}
                    onChange={(e) => {
                      setBasePrice(e.target.value);
                      touch();
                    }}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle>Categories</CardTitle>
              </div>
              <CardDescription>Assign this product to one or more categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(categories ?? []).map((cat) => (
                  <label
                    key={cat.id}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-md px-2 text-sm hover:bg-surface-sunken"
                  >
                    <Checkbox
                      checked={categoryIds.includes(cat.id)}
                      onCheckedChange={(on) => {
                        setCategoryIds((prev) =>
                          on ? [...prev, cat.id] : prev.filter((x) => x !== cat.id),
                        );
                        touch();
                      }}
                      aria-label={cat.name}
                    />
                    {cat.name}
                  </label>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-muted-foreground">No categories yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Sticky save bar (appears when dirty) ── */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface/95 backdrop-blur transition-transform duration-base',
          dirty ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="text-sm font-medium text-muted-foreground">You have unsaved changes</p>
          <div className="flex gap-2">
            <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Discard
            </Link>
            <Button size="sm" loading={save.isPending} onClick={onSubmit}>
              {product ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </div>
      </div>

      {/* Always-available create button when not dirty (new product) */}
      {!dirty && !product && (
        <div className="mt-6">
          <Button loading={save.isPending} onClick={onSubmit}>
            Create product
          </Button>
        </div>
      )}
    </div>
  );
}

function AddImageByUrl({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState('');
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="img-url" className="mb-1.5 block text-sm font-medium">
          Add image by URL
        </Label>
        <Input
          id="img-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
        />
      </div>
      <Button
        variant="secondary"
        onClick={() => {
          if (url.trim()) {
            onAdd(url.trim());
            setUrl('');
          }
        }}
      >
        Add
      </Button>
    </div>
  );
}
