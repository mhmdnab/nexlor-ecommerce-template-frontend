'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@repo/types';
import {
  Button,
  EmptyState,
  Field,
  Input,
  Price,
  Skeleton,
  StatusBadge,
  Tabs,
  useToast,
} from '@repo/ui';
import { formatDate } from '@repo/ui';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin, useLogout, useMe, useMyOrders, useRegister } from '@/lib/queries';

export default function AccountPage() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    );
  }

  return me ? <AccountDashboard name={me.name} email={me.email} /> : <AuthPanel />;
}

function AuthPanel() {
  const [tab, setTab] = useState('login');
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold">Welcome</h1>
        <p className="mt-1 text-muted-foreground">Sign in or create an account.</p>
      </div>
      <div className="mt-6 flex justify-center">
        <Tabs
          items={[
            { value: 'login', label: 'Sign in' },
            { value: 'register', label: 'Create account' },
          ]}
          value={tab}
          onValueChange={setTab}
        />
      </div>
      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        {tab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
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
      <Button type="submit" className="w-full" loading={login.isPending}>
        Sign in
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
      <Button type="submit" className="w-full" loading={registerMut.isPending}>
        Create account
      </Button>
    </form>
  );
}

function AccountDashboard({ name, email }: { name: string; email: string }) {
  const logout = useLogout();
  const orders = useMyOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Hi, {name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">{email}</p>
        </div>
        <Button variant="secondary" onClick={() => logout.mutate()} loading={logout.isPending}>
          Sign out
        </Button>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Order history</h2>
      {orders.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !orders.data || orders.data.data.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No orders yet"
          description="When you place an order it will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {orders.data.data.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <p className="tabular font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)} · {order.items.length} items</p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <Price cents={order.totals.total} currency={order.currency} className="font-medium" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Looking for something?{' '}
        <Link href="/products" className="font-medium text-foreground hover:underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
