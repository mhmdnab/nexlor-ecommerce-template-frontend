import type { ProductDetail } from '@repo/types';
import type { Metadata } from 'next';
import { ProductDetailView } from '@/components/ProductDetailView';
import { apiGet } from '@/lib/api';

interface Params {
  params: Promise<{ slug: string }>;
}

// SEO: per-product metadata + OG tags, fetched server-side.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await apiGet<ProductDetail>(`/products/${slug}`);
    const image = product.images[0]?.url;
    return {
      title: product.name,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 160),
        images: image ? [{ url: image }] : undefined,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
