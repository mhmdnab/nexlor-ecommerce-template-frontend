import { z } from 'zod';

/** Form schemas shared by storefront + admin (used with RHF zodResolver). */

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Tell us your name.').max(80),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  line1: z.string().min(1, 'Address is required.'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required.'),
  region: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required.'),
  country: z.string().min(2, 'Country is required.'),
  phone: z.string().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  shippingAddress: addressSchema,
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
