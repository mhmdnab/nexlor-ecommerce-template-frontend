'use client';

import type {
  AuthResponse,
  CartView,
  CategoryNode,
  OrderView,
  Paginated,
  ProductCard,
  ProductDetail,
  PublicUser,
  StoreSettings,
} from '@repo/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { apiFetch, apiJson } from './api';

export const qk = {
  products: (params: string) => ['products', params] as const,
  product: (slug: string) => ['product', slug] as const,
  related: (slug: string) => ['related', slug] as const,
  categories: ['categories'] as const,
  settings: ['settings'] as const,
  cart: ['cart'] as const,
  me: ['me'] as const,
  myOrders: ['my-orders'] as const,
  order: (n: string) => ['order', n] as const,
};

export interface ProductQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

function toSearch(params: object): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ---- catalog ----

export function useProducts(params: ProductQuery) {
  const search = toSearch(params);
  return useQuery({
    queryKey: qk.products(search),
    queryFn: () => apiFetch<Paginated<ProductCard>>(`/products${search}`),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: qk.product(slug),
    queryFn: () => apiFetch<ProductDetail>(`/products/${slug}`),
  });
}

export function useRelated(slug: string) {
  return useQuery({
    queryKey: qk.related(slug),
    queryFn: () => apiFetch<ProductCard[]>(`/products/${slug}/related`),
  });
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => apiFetch<CategoryNode[]>('/categories') });
}

export function useSettings() {
  return useQuery({ queryKey: qk.settings, queryFn: () => apiFetch<StoreSettings>('/settings') });
}

// ---- cart ----

export function useCart() {
  return useQuery({ queryKey: qk.cart, queryFn: () => apiFetch<CartView>('/cart') });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { variantId: string; quantity: number }) =>
      apiJson<CartView>('/cart/items', 'POST', vars),
    onSuccess: (data) => qc.setQueryData(qk.cart, data),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { itemId: string; quantity: number }) =>
      apiJson<CartView>(`/cart/items/${vars.itemId}`, 'PATCH', { quantity: vars.quantity }),
    onSuccess: (data) => qc.setQueryData(qk.cart, data),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => apiFetch<CartView>(`/cart/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: (data) => qc.setQueryData(qk.cart, data),
  });
}

export function useApplyCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiJson<CartView>('/cart/coupon', 'POST', { code }),
    onSuccess: (data) => qc.setQueryData(qk.cart, data),
  });
}

export function useRemoveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<CartView>('/cart/coupon', { method: 'DELETE' }),
    onSuccess: (data) => qc.setQueryData(qk.cart, data),
  });
}

// ---- auth ----

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      try {
        return await apiFetch<PublicUser>('/auth/me');
      } catch {
        return null; // unauthenticated is a valid state
      }
    },
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      apiJson<AuthResponse>('/auth/login', 'POST', vars),
    onSuccess: (data) => {
      qc.setQueryData(qk.me, data.user);
      qc.invalidateQueries({ queryKey: qk.cart });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name: string; email: string; password: string }) =>
      apiJson<AuthResponse>('/auth/register', 'POST', vars),
    onSuccess: (data) => {
      qc.setQueryData(qk.me, data.user);
      qc.invalidateQueries({ queryKey: qk.cart });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiJson<{ success: boolean }>('/auth/logout', 'POST'),
    onSuccess: () => {
      qc.setQueryData(qk.me, null);
      qc.invalidateQueries({ queryKey: qk.cart });
    },
  });
}

// ---- orders ----

export function useCheckout() {
  return useMutation({
    mutationFn: (vars: { email: string; shippingAddress: Record<string, unknown> }) =>
      apiJson<OrderView>('/checkout', 'POST', vars),
  });
}

export function usePayOrder() {
  return useMutation({
    mutationFn: (orderId: string) => apiJson<OrderView>(`/orders/${orderId}/pay`, 'POST'),
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: qk.myOrders,
    queryFn: () => apiFetch<Paginated<OrderView>>('/account/orders'),
  });
}

export function useOrder(orderNumber: string) {
  return useQuery({
    queryKey: qk.order(orderNumber),
    queryFn: () => apiFetch<OrderView>(`/orders/${orderNumber}`),
  });
}
