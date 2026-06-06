'use client';

import type {
  AuthResponse,
  CategoryNode,
  CouponType,
  CustomerListItem,
  DashboardOverview,
  OrderStatus,
  OrderView,
  Paginated,
  ProductDetail,
  PublicUser,
  StoreSettings,
  VariantPreset,
} from '@repo/types';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiFetch, apiJson } from './api';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  expiresAt: string | null;
  minSubtotal: number | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  email: string;
  status: OrderStatus;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface CustomerDetail extends CustomerListItem {
  addresses: unknown[];
  orders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    currency: string;
    itemCount: number;
    createdAt: string;
  }[];
}

function search(params: object): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const qk = {
  me: ['me'] as const,
  overview: (days: number, g: string) => ['overview', days, g] as const,
  recentOrders: ['recent-orders'] as const,
  products: (s: string) => ['admin-products', s] as const,
  product: (id: string) => ['admin-product', id] as const,
  categories: ['admin-categories'] as const,
  orders: (s: string) => ['admin-orders', s] as const,
  order: (id: string) => ['admin-order', id] as const,
  customers: (s: string) => ['admin-customers', s] as const,
  customer: (id: string) => ['admin-customer', id] as const,
  coupons: (s: string) => ['admin-coupons', s] as const,
  variantPresets: ['admin-variant-presets'] as const,
  settings: ['admin-settings'] as const,
};

// ---- auth ----
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      try {
        return await apiFetch<PublicUser>('/auth/me');
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { email: string; password: string }) => apiJson<AuthResponse>('/auth/login', 'POST', v),
    onSuccess: (data) => qc.setQueryData(qk.me, data.user),
  });
}
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiJson('/auth/logout', 'POST'),
    onSuccess: () => qc.setQueryData(qk.me, null),
  });
}

// ---- dashboard ----
export function useOverview(days = 30, granularity = 'day') {
  return useQuery({
    queryKey: qk.overview(days, granularity),
    queryFn: () => apiFetch<DashboardOverview>(`/admin/dashboard/overview?days=${days}&granularity=${granularity}`),
  });
}
export function useRecentOrders() {
  return useQuery({
    queryKey: qk.recentOrders,
    queryFn: () => apiFetch<RecentOrder[]>('/admin/dashboard/recent-orders'),
  });
}

// ---- products ----
export interface AdminProductQuery {
  q?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
export function useAdminProducts(params: AdminProductQuery) {
  const s = search(params);
  return useQuery({
    queryKey: qk.products(s),
    queryFn: () => apiFetch<Paginated<ProductDetail>>(`/admin/products${s}`),
    placeholderData: keepPreviousData,
  });
}
export function useAdminProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: qk.product(id),
    queryFn: () => apiFetch<ProductDetail>(`/admin/products/${id}`),
    enabled,
  });
}
export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id?: string; body: unknown }) =>
      vars.id
        ? apiJson<ProductDetail>(`/admin/products/${vars.id}`, 'PUT', vars.body)
        : apiJson<ProductDetail>('/admin/products', 'POST', vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}
export function useBulkStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { ids: string[]; status: string }) =>
      apiJson('/admin/products/bulk/status', 'PATCH', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}
export function usePresignUpload() {
  return useMutation({
    mutationFn: (vars: { filename: string; contentType: string }) =>
      apiJson<{ uploadUrl: string; publicUrl: string; key: string }>('/admin/uploads/presign', 'POST', vars),
  });
}

// ---- categories ----
export function useAdminCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => apiFetch<CategoryNode[]>('/admin/categories') });
}
export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id?: string; body: unknown }) =>
      vars.id
        ? apiJson(`/admin/categories/${vars.id}`, 'PUT', vars.body)
        : apiJson('/admin/categories', 'POST', vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

// ---- variant presets ----
export function useAdminVariantPresets() {
  return useQuery({
    queryKey: qk.variantPresets,
    queryFn: () => apiFetch<VariantPreset[]>('/admin/variant-presets'),
  });
}
export function useSaveVariantPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id?: string; body: unknown }) =>
      vars.id
        ? apiJson(`/admin/variant-presets/${vars.id}`, 'PUT', vars.body)
        : apiJson('/admin/variant-presets', 'POST', vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.variantPresets }),
  });
}
export function useDeleteVariantPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/variant-presets/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.variantPresets }),
  });
}

// ---- orders ----
export interface AdminOrderQuery {
  q?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
export function useAdminOrders(params: AdminOrderQuery) {
  const s = search(params);
  return useQuery({
    queryKey: qk.orders(s),
    queryFn: () => apiFetch<Paginated<OrderView>>(`/admin/orders${s}`),
    placeholderData: keepPreviousData,
  });
}
export function useAdminOrder(id: string) {
  return useQuery({ queryKey: qk.order(id), queryFn: () => apiFetch<OrderView>(`/admin/orders/${id}`) });
}
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: OrderStatus }) =>
      apiJson<OrderView>(`/admin/orders/${vars.id}/status`, 'PATCH', { status: vars.status }),
    onSuccess: (data) => {
      qc.setQueryData(qk.order(data.id), data);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

// ---- customers ----
export function useAdminCustomers(params: { q?: string; page?: number; limit?: number }) {
  const s = search(params);
  return useQuery({
    queryKey: qk.customers(s),
    queryFn: () => apiFetch<Paginated<CustomerListItem>>(`/admin/customers${s}`),
    placeholderData: keepPreviousData,
  });
}
export function useAdminCustomer(id: string) {
  return useQuery({ queryKey: qk.customer(id), queryFn: () => apiFetch<CustomerDetail>(`/admin/customers/${id}`) });
}

// ---- coupons ----
export function useAdminCoupons(params: { page?: number; limit?: number }) {
  const s = search(params);
  return useQuery({ queryKey: qk.coupons(s), queryFn: () => apiFetch<Paginated<Coupon>>(`/admin/coupons${s}`) });
}
export function useSaveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id?: string; body: unknown }) =>
      vars.id ? apiJson(`/admin/coupons/${vars.id}`, 'PUT', vars.body) : apiJson('/admin/coupons', 'POST', vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
}
export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
}

// ---- settings ----
export function useAdminSettings() {
  return useQuery({ queryKey: qk.settings, queryFn: () => apiFetch<StoreSettings>('/admin/settings') });
}
export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StoreSettings>) => apiJson<StoreSettings>('/admin/settings', 'PUT', body),
    onSuccess: (data) => qc.setQueryData(qk.settings, data),
  });
}
