'use client';

import { cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCartUI } from '@/app/providers';
import { useCart, useMe, useSettings } from '@/lib/queries';

const NAV = [
  { href: '/products', label: 'Shop all' },
  { href: '/products?category=apparel', label: 'Apparel' },
  { href: '/products?category=footwear', label: 'Footwear' },
  { href: '/products?category=accessories', label: 'Accessories' },
];

/**
 * Inner nav component that reads useSearchParams for active-state detection.
 * Must be Suspense-wrapped because useSearchParams opts the subtree out of
 * static pre-rendering (Next.js App Router requirement).
 *
 * Active-state heuristic:
 *   - "Shop all" (/products, no query) → active when pathname matches AND no
 *     category param is present.
 *   - Category links (/products?category=X) → active when pathname AND category
 *     param both match.
 * Flag: if NAV items grow to use additional query params or nested paths,
 * revisit this logic.
 */
function PrimaryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(href: string) {
    const [hrefPath, hrefQuery] = href.split('?');
    if (pathname !== hrefPath) return false;
    if (!hrefQuery) return !searchParams.get('category');
    const params = new URLSearchParams(hrefQuery);
    return params.get('category') === searchParams.get('category');
  }

  return (
    <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Primary">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-h-[44px] items-center text-sm font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
            {active && (
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-brand"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const { openCart } = useCartUI();
  const { data: cart } = useCart();
  const { data: me } = useMe();
  const { data: settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const count = cart?.itemCount ?? 0;
  const storeName = settings?.branding.storeName ?? 'Nexlor';

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky transition-[background-color,border-color,backdrop-filter] duration-base',
        scrolled
          ? 'border-b border-glass-border bg-glass-tint/80 supports-[backdrop-filter]:bg-glass-tint/65 supports-[backdrop-filter]:backdrop-blur-glass'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-surface-sunken md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
          {storeName}
        </Link>

        {/*
         * Suspense boundary required by Next.js 15 App Router: useSearchParams
         * inside PrimaryNav would suspend static generation without it.
         * Fallback renders static (inactive) nav links so there's no layout
         * shift on hydration.
         */}
        <Suspense
          fallback={
            <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Primary">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex min-h-[44px] items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          }
        >
          <PrimaryNav />
        </Suspense>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/products"
            aria-label="Search products"
            className="grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-surface-sunken"
          >
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="/account"
            aria-label={me ? 'Your account' : 'Sign in'}
            className="grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-surface-sunken"
          >
            <User className="h-5 w-5" aria-hidden />
          </Link>
          <button
            type="button"
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-surface-sunken"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="tabular absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile sheet menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-drawer md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface p-5 shadow-xl"
              aria-label="Mobile"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-serif text-xl font-semibold">{storeName}</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-sunken"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-surface-sunken"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
