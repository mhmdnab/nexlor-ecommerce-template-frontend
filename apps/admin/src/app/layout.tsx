import { themeScript } from '@repo/ui';
import type { Metadata } from 'next';
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';
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
  title: { default: 'Nexlor Admin', template: '%s · Nexlor Admin' },
  description: 'Management dashboard for the Nexlor commerce template.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
