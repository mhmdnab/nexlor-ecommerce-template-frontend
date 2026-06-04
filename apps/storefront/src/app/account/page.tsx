'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@repo/types';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Eyebrow,
  Field,
  GradientText,
  Input,
  Price,
  Reveal,
  Section,
  Skeleton,
  StatusBadge,
  Tabs,
  cn,
  formatDate,
  useToast,
} from '@repo/ui';
import { ArrowRight, LogOut, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin, useLogout, useMe, useMyOrders, useRegister } from '@/lib/queries';

export default function AccountPage() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-10 w-56 mb-2" />
        <Skeleton className="h-80 w-full rounded-lg mt-6" />
      </div>
    );
  }

  return me ? <AccountDashboard name={me.name} email={me.email} /> : <AuthPanel />;
}

function AuthPanel() {
  const [tab, setTab] = useState('login');
  return (
    <Section tone="default" container>
      <div className="mx-auto max-w-md">
        <Reveal>
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">
            Welcome <GradientText>back</GradientText>
          </h1>
          <p className="mt-2 text-muted-foreground">Sign in or create an account to continue.</p>
        </Reveal>

        <Reveal delayIndex={1} className="mt-8">
          <div className="flex justify-start mb-6">
            <Tabs
              items={[
                { value: 'login', label: 'Sign in' },
                { value: 'register', label: 'Create account' },
              ]}
              value={tab}
              onValueChange={setTab}
            />
          </div>
          <Card>
            <CardContent className="pt-5">
              {tab === 'login' ? <LoginForm /> : <RegisterForm />}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

function LoginForm() {
  const login = useLogin();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'customer@nexlor.test', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    try {
      await login.mutateAsync(values);
      toast({ title: 'Signed in', tone: 'success' });
    } catch (err) {
      toast({ title: 'Sign in failed', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email" required error={errors.email?.message}>
        {({ id, invalid }) => <Input id={id} type="email" autoComplete="email" invalid={invalid} {...register('email')} />}
      </Field>
      <Field label="Password" required error={errors.password?.message}>
        {({ id, invalid }) => <Input id={id} type="password" autoComplete="current-password" invalid={invalid} {...register('password')} />}
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
        Sign in
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}

function RegisterForm() {
  const registerMut = useRegister();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await registerMut.mutateAsync(values);
      toast({ title: 'Account created', tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not create account', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Name" required error={errors.name?.message}>
        {({ id, invalid }) => <Input id={id} autoComplete="name" invalid={invalid} {...register('name')} />}
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        {({ id, invalid }) => <Input id={id} type="email" autoComplete="email" invalid={invalid} {...register('email')} />}
      </Field>
      <Field label="Password" required error={errors.password?.message} helper="At least 8 characters.">
        {({ id, invalid }) => <Input id={id} type="password" autoComplete="new-password" invalid={invalid} {...register('password')} />}
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={registerMut.isPending}>
        Create account
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}

function AccountDashboard({ name, email }: { name: string; email: string }) {
  const logout = useLogout();
  const orders = useMyOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* ── Profile header ── */}
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow>Your account</Eyebrow>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">
              Hi, <GradientText>{name.split(' ')[0]}</GradientText>
            </h1>
            <p className="mt-1 text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logout.mutate()}
            loading={logout.isPending}
            className="mt-4 shrink-0"
            aria-label="Sign out of your account"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </Reveal>

      {/* ── Order history ── */}
      <Reveal delayIndex={1} className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold">Order history</h2>
        </div>

        {orders.isLoading ? (
          <div className="space-y-3" aria-label="Loading orders">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium">Could not load orders</p>
              <p className="mt-1 text-sm text-muted-foreground">Something went wrong fetching your order history.</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => orders.refetch()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : !orders.data || orders.data.data.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" aria-hidden />}
            title="No orders yet"
            description="When you place an order it will appear here."
            action={
              <Link href="/products">
                <Button size="sm">
                  Start shopping
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            }
          />
        ) : (
          <Card>
            <ul className="divide-y divide-border" role="list">
              {orders.data.data.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/order/${order.orderNumber}`}
                    className={cn(
                      'flex items-center justify-between gap-4 px-5 py-4',
                      'transition-colors duration-fast hover:bg-surface-sunken',
                      'focus-visible:bg-surface-sunken focus-visible:outline-none',
                      'group',
                    )}
                    aria-label={`View order ${order.orderNumber}`}
                  >
                    <div className="min-w-0">
                      <p className="tabular font-medium text-foreground">{order.orderNumber}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <StatusBadge status={order.status} />
                      <Price cents={order.totals.total} currency={order.currency} className="tabular font-semibold text-foreground" />
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Reveal>

      <Reveal delayIndex={2} className="mt-8">
        <p className="text-sm text-muted-foreground">
          Looking for something?{' '}
          <Link href="/products" className="font-medium text-foreground underline-offset-2 hover:underline">
            Continue shopping
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
