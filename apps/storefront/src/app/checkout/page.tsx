'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutInput } from '@repo/types';
import { Button, Field, Input, Spinner, buttonVariants, useToast } from '@repo/ui';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CartSummary } from '@/components/cart/CartSummary';
import { qk, useCart, useCheckout, useMe, usePayOrder } from '@/lib/queries';

export default function CheckoutPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: cart, isLoading } = useCart();
  const { data: me } = useMe();
  const checkout = useCheckout();
  const payOrder = usePayOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: me?.email ?? '', shippingAddress: { country: 'US' } },
  });

  const placing = checkout.isPending || payOrder.isPending;

  async function onSubmit(values: CheckoutInput) {
    try {
      const order = await checkout.mutateAsync({
        email: values.email,
        shippingAddress: values.shippingAddress as unknown as Record<string, unknown>,
      });
      // Stubbed payment — design the success/failure states fully regardless.
      await payOrder.mutateAsync(order.id);
      qc.invalidateQueries({ queryKey: qk.cart });
      toast({ title: 'Order placed', description: order.orderNumber, tone: 'success' });
      router.push(`/order/${order.orderNumber}`);
    } catch (err) {
      toast({ title: 'Checkout failed', description: (err as Error).message, tone: 'error' });
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-5xl place-items-center px-4 py-32">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something before checking out.</p>
        <Link href="/products" className={buttonVariants({ className: 'mt-6' })}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {/* Contact */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Contact</h2>
            <Field label="Email" required error={errors.email?.message}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} invalid={invalid} {...register('email')} />
              )}
            </Field>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full name" required error={errors.shippingAddress?.fullName?.message}>
                  {({ id, invalid }) => <Input id={id} autoComplete="name" invalid={invalid} {...register('shippingAddress.fullName')} />}
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Address" required error={errors.shippingAddress?.line1?.message}>
                  {({ id, invalid }) => <Input id={id} autoComplete="address-line1" invalid={invalid} {...register('shippingAddress.line1')} />}
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Apartment, suite, etc. (optional)">
                  {({ id }) => <Input id={id} autoComplete="address-line2" {...register('shippingAddress.line2')} />}
                </Field>
              </div>
              <Field label="City" required error={errors.shippingAddress?.city?.message}>
                {({ id, invalid }) => <Input id={id} autoComplete="address-level2" invalid={invalid} {...register('shippingAddress.city')} />}
              </Field>
              <Field label="State / Region">
                {({ id }) => <Input id={id} autoComplete="address-level1" {...register('shippingAddress.region')} />}
              </Field>
              <Field label="Postal code" required error={errors.shippingAddress?.postalCode?.message}>
                {({ id, invalid }) => <Input id={id} autoComplete="postal-code" invalid={invalid} {...register('shippingAddress.postalCode')} />}
              </Field>
              <Field label="Country" required error={errors.shippingAddress?.country?.message}>
                {({ id, invalid }) => <Input id={id} autoComplete="country" invalid={invalid} {...register('shippingAddress.country')} />}
              </Field>
            </div>
          </section>

          <p className="text-sm text-muted-foreground">
            {/* Payment is stubbed in this template. Wire a PSP at the checkout mutation. */}
            Payment is simulated for this template — placing the order marks it paid.
          </p>
        </div>

        {/* Summary rail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary cart={cart}>
            <Button type="submit" size="lg" className="w-full" loading={placing} leftIcon={<Lock className="h-4 w-4" />}>
              Pay {/* amount shown in summary */}
            </Button>
          </CartSummary>
        </div>
      </form>
    </div>
  );
}
