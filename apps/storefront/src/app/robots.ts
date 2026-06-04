import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = env.SITE_URL.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account', '/checkout', '/cart'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
