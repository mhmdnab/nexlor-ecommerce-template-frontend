import { themeScript } from '@repo/ui';
import type { Metadata } from 'next';
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CartSheet } from '@/components/cart/CartSheet';
import { env } from '@/lib/env';
import { Providers } from './providers';
import './globals.css';

const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: 'Nexlor — Considered goods for everyday life', template: '%s · Nexlor' },
  description: 'A premium, modern storefront built on the Nexlor commerce template.',
  openGraph: { type: 'website', siteName: 'Nexlor' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          {/* Skip link — keyboard users jump past the nav. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg"
          >
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartSheet />
        </Providers>
      </body>
    </html>
  );
}
