import type { MetadataRoute } from 'next';
import type { Paginated, ProductCard } from '@repo/types';
import { apiGet } from '@/lib/api';
import { env } from '@/lib/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL.replace(/\/$/, '');
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/account`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const products = await apiGet<Paginated<ProductCard>>('/products?limit=100');
    const productRoutes: MetadataRoute.Sitemap = products.data.map((p) => ({
      url: `${base}/products/${p.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
