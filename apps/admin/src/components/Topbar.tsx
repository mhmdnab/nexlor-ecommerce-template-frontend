'use client';

import { ThemeToggle } from '@repo/ui';
import { ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLogout, useMe } from '@/lib/queries';

export function Topbar({ title }: { title: string }) {
  const { data: me } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function signOut() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  const initials = me?.name
    ? me.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '–';

  return (
    <header className="sticky top-0 z-sticky flex h-16 items-center gap-4 border-b border-glass-border bg-glass-tint/80 px-4 supports-[backdrop-filter]:bg-glass-tint/65 supports-[backdrop-filter]:backdrop-blur-glass sm:px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-surface-sunken"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium sm:block">{me?.name ?? 'Account'}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-border bg-surface-raised shadow-lg"
            >
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-medium">{me?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{me?.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-surface-sunken"
              >
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
