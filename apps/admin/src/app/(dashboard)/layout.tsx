'use client';

import { Role } from '@repo/types';
import { Spinner } from '@repo/ui';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useMe } from '@/lib/queries';

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === '/', title: 'Dashboard' },
  { match: (p) => p.startsWith('/products'), title: 'Products' },
  { match: (p) => p.startsWith('/categories'), title: 'Categories' },
  { match: (p) => p.startsWith('/variants'), title: 'Variants' },
  { match: (p) => p.startsWith('/orders'), title: 'Orders' },
  { match: (p) => p.startsWith('/customers'), title: 'Customers' },
  { match: (p) => p.startsWith('/coupons'), title: 'Coupons' },
  { match: (p) => p.startsWith('/settings'), title: 'Settings' },
  { match: (p) => p.startsWith('/styleguide'), title: 'Style guide' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isFetched } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = me?.role === Role.ADMIN || me?.role === Role.SUPER_ADMIN;

  useEffect(() => {
    if (isFetched && !isAdmin) router.replace('/login');
  }, [isFetched, isAdmin, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const title = TITLES.find((t) => t.match(pathname))?.title ?? 'Dashboard';

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
