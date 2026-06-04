'use client';

import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/lib/queries';

const COLUMNS = [
  { title: 'Shop', links: [['Shop all', '/products'], ['Apparel', '/products?category=apparel'], ['Footwear', '/products?category=footwear'], ['Home', '/products?category=home']] },
  { title: 'Account', links: [['Sign in', '/account'], ['Order history', '/account'], ['Cart', '/cart']] },
  { title: 'Company', links: [['About', '/products'], ['Sustainability', '/products'], ['Contact', '/products']] },
];

export function Footer() {
  const { data: settings } = useSettings();
  const storeName = settings?.branding.storeName ?? 'Nexlor';

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="font-serif text-2xl font-semibold">{storeName}</div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {settings?.branding.tagline ?? 'Considered goods for everyday life.'}
            </p>
            <form className="mt-5 flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                aria-label="Email for newsletter"
                placeholder="Email address"
                className="h-10 flex-1 rounded-md border border-border-strong bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
                Subscribe
              </button>
            </form>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {storeName}. Built on the Nexlor template.</p>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" aria-hidden /> Secure checkout</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4" aria-hidden /> Fast shipping</span>
            <span className="inline-flex items-center gap-1.5"><RotateCcw className="h-4 w-4" aria-hidden /> Easy returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
