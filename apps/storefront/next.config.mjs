/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile the workspace packages (they ship TS source, no build step).
  transpilePackages: ['@repo/ui', '@repo/types'],
  images: {
    // Demo/seed images come from picsum; product images from your R2 CDN.
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
