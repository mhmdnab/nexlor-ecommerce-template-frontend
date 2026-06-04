/**
 * Shared enums — mirrored verbatim from the Prisma schema
 * (backend/prisma/schema.prisma). If you change one, change both.
 */
export const Role = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const CouponType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
} as const;
export type CouponType = (typeof CouponType)[keyof typeof CouponType];

/** Semantic badge mapping for order statuses (see UI/UX prompt §4.3). */
export const ORDER_STATUS_TONE: Record<OrderStatus, 'warning' | 'info' | 'success' | 'neutral' | 'danger'> = {
  PENDING: 'warning',
  PAID: 'info',
  FULFILLED: 'success',
  CANCELLED: 'neutral',
  REFUNDED: 'danger',
};
