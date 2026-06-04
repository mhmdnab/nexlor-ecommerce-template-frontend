'use client';

import { ToastProvider } from '@repo/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { createContext, useContext, useMemo, useState } from 'react';

/** Controls the slide-in cart sheet from anywhere (header, PDP add-to-cart). */
interface CartUI {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (v: boolean) => void;
}
const CartUIContext = createContext<CartUI | null>(null);
export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error('useCartUI must be used within Providers.');
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [open, setOpen] = useState(false);
  const cartUI = useMemo<CartUI>(
    () => ({ open, openCart: () => setOpen(true), closeCart: () => setOpen(false), setOpen }),
    [open],
  );

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={client}>
        <ToastProvider>
          <CartUIContext.Provider value={cartUI}>{children}</CartUIContext.Provider>
        </ToastProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}
