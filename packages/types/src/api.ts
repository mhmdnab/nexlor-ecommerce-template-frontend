import type { OrderStatus, ProductStatus, Role } from './enums';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  price: number; // cents
  image: string | null;
  imageAlt: string;
  inStock: boolean;
  lowStock: boolean;
  isNew: boolean;
  categorySlugs: string[];
  status: ProductStatus;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  priceOverride: number | null;
  stock: number;
  inStock: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  price: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: { id: string; slug: string; name: string }[];
}

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  position: number;
  productCount: number;
  children: CategoryNode[];
}

export interface VariantPreset {
  id: string;
  name: string;
  options: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  id: string;
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
  stock: number;
  inStock: boolean;
}

export interface MoneyTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CartView {
  id: string;
  items: CartLine[];
  itemCount: number;
  coupon: { code: string; valid: boolean; reason?: string } | null;
  currency: string;
  totals: MoneyTotals;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email: string;
  currency: string;
  couponCode: string | null;
  totals: MoneyTotals;
  shippingAddress: Address;
  billingAddress: Address | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  branding: { storeName: string; logoUrl: string; brandColor: string; tagline: string };
  commerce: { currency: string; taxRatePercent: number; taxInclusive: boolean };
  shipping: { flatRate: number; freeShippingThreshold: number };
}

export interface DashboardStat {
  value: number;
  delta: number | null;
}
export interface DashboardOverview {
  range: { days: number; granularity: string; from: string; to: string };
  stats: {
    revenue: DashboardStat;
    orders: DashboardStat;
    averageOrderValue: DashboardStat;
    newCustomers: DashboardStat;
  };
  revenueSeries: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  topProducts: { name: string; units: number; revenue: number; image: string | null }[];
  lowStock: {
    variantId: string;
    productName: string;
    productSlug: string;
    variantName: string;
    sku: string;
    stock: number;
  }[];
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  orderCount: number;
  lifetimeValue: number;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
}
