'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, Role, type LoginInput } from '@repo/types';
import { Button, Field, Input, useToast } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin, useMe } from '@/lib/queries';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const login = useLogin();
  const { data: me } = useMe();

  useEffect(() => {
    if (me && (me.role === Role.ADMIN || me.role === Role.SUPER_ADMIN)) router.replace('/');
  }, [me, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@nexlor.test', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const res = await login.mutateAsync(values);
      if (res.user.role === Role.CUSTOMER) {
        toast({ title: 'Access denied', description: 'This account is not an admin.', tone: 'error' });
        return;
      }
      router.replace('/');
    } catch (err) {
      toast({ title: 'Sign in failed', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-semibold tracking-tight">Nexlor Admin</div>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your store.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
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
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Seeded: admin@nexlor.test / owner@nexlor.test · Password123!
        </p>
      </div>
    </div>
  );
}
