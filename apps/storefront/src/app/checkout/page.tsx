'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutInput } from '@repo/types';
import { Button, Eyebrow, Field, Input, Marquee, Spinner, buttonVariants, useToast } from '@repo/ui';
import { Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { FieldPath } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { CartSummary } from '@/components/cart/CartSummary';
import { qk, useCart, useCheckout, useMe, usePayOrder } from '@/lib/queries';

const TRUST_POINTS = ['Secure checkout', 'Encrypted payment', '30-day returns', 'Carbon-neutral delivery'];

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
    setFocus,
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

  // Additive UX: move focus to the first invalid field on a failed submit.
  // Validation logic itself is unchanged (still Zod via the resolver).
  function onInvalid(formErrors: typeof errors) {
    const order: FieldPath<CheckoutInput>[] = [
      'email',
      'shippingAddress.fullName',
      'shippingAddress.line1',
      'shippingAddress.city',
      'shippingAddress.region',
      'shippingAddress.postalCode',
      'shippingAddress.country',
    ];
    const first = order.find((path) => {
      const [group, key] = path.split('.');
      return key
        ? (formErrors as Record<string, Record<string, unknown> | undefined>)[group]?.[key]
        : (formErrors as Record<string, unknown>)[group];
    });
    if (first) setFocus(first);
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
        <Eyebrow className="text-center">Checkout</Eyebrow>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something before checking out.</p>
        <Link href="/products" className={buttonVariants({ className: 'mt-6' })}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Eyebrow>Secure checkout</Eyebrow>
      <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Contact */}
          <fieldset className="rounded-lg border border-border bg-surface p-6">
            <legend className="px-2 font-serif text-xl font-semibold">Contact</legend>
            <div className="mt-2">
              <Field label="Email" required error={errors.email?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    type="email"
                    inputMode="email"
                    autoCapitalize="off"
                    autoComplete="email"
                    aria-describedby={describedBy}
                    invalid={invalid}
                    {...register('email')}
                  />
                )}
              </Field>
            </div>
          </fieldset>

          {/* Shipping */}
          <fieldset className="rounded-lg border border-border bg-surface p-6">
            <legend className="px-2 font-serif text-xl font-semibold">Shipping address</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full name" required error={errors.shippingAddress?.fullName?.message}>
                  {({ id, invalid }) => (
                    <Input id={id} autoComplete="name" invalid={invalid} {...register('shippingAddress.fullName')} />
                  )}
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Address" required error={errors.shippingAddress?.line1?.message}>
                  {({ id, invalid }) => (
                    <Input
                      id={id}
                      autoComplete="address-line1"
                      invalid={invalid}
                      {...register('shippingAddress.line1')}
                    />
                  )}
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Apartment, suite, etc. (optional)">
                  {({ id }) => <Input id={id} autoComplete="address-line2" {...register('shippingAddress.line2')} />}
                </Field>
              </div>
              <Field label="City" required error={errors.shippingAddress?.city?.message}>
                {({ id, invalid }) => (
                  <Input id={id} autoComplete="address-level2" invalid={invalid} {...register('shippingAddress.city')} />
                )}
              </Field>
              <Field label="State / Region">
                {({ id }) => (
                  <Input id={id} autoComplete="address-level1" {...register('shippingAddress.region')} />
                )}
              </Field>
              <Field label="Postal code" required error={errors.shippingAddress?.postalCode?.message}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    inputMode="text"
                    autoComplete="postal-code"
                    invalid={invalid}
                    {...register('shippingAddress.postalCode')}
                  />
                )}
              </Field>
              <Field label="Country" required error={errors.shippingAddress?.country?.message}>
                {({ id, invalid }) => (
                  <Input id={id} autoComplete="country" invalid={invalid} {...register('shippingAddress.country')} />
                )}
              </Field>
            </div>
          </fieldset>

          <p className="text-sm text-muted-foreground">
            {/* Payment is stubbed in this template. Wire a PSP at the checkout mutation. */}
            Payment is simulated for this template — placing the order marks it paid.
          </p>
        </div>

        {/* Summary rail */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CartSummary cart={cart}>
            {/* Solid CTA: lives inside the summary Card surface (not a plain light
                bg). One primary per screen. Amount is shown in the summary above. */}
            <Button type="submit" size="lg" className="w-full" loading={placing} leftIcon={<Lock className="h-4 w-4" />}>
              Pay {/* amount shown in summary */}
            </Button>
          </CartSummary>

          {/* Trust strip — reassurance, decorative only */}
          <div className="overflow-hidden rounded-lg border border-border bg-surface py-3">
            <div className="mb-2 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
              Protected by encryption
            </div>
            <Marquee aria-hidden>
              {TRUST_POINTS.map((label) => (
                <span key={label} className="flex items-center">
                  <span className="px-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </form>
    </div>
  );
}
