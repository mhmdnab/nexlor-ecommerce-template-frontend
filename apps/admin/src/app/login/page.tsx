'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, Role, type LoginInput } from '@repo/types';
import { Button, Card, CardContent, CardHeader, Eyebrow, Field, Input, useToast } from '@repo/ui';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin, useMe } from '@/lib/queries';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const login = useLogin();
  const { data: me } = useMe();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (me && (me.role === Role.ADMIN || me.role === Role.SUPER_ADMIN)) router.replace('/');
  }, [me, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
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
    <div className="relative grid min-h-screen place-items-center px-4">
      {/* Subtle decorative backdrop — reduced-motion-safe (no animation, just static gradient) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 rounded-full bg-gradient-brand opacity-[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" aria-hidden />
            </span>
          </div>
          <Eyebrow className="mb-1">Admin Portal</Eyebrow>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Sign in to{' '}
            <span className="text-foreground">
              Nexlor<span className="text-gold">.</span>
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store settings, orders, and catalog.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-foreground">Welcome back</p>
            <p className="text-xs text-muted-foreground">Enter your credentials to continue.</p>
          </CardHeader>
          <CardContent className="pt-3">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Field label="Email address" required error={errors.email?.message}>
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    type="email"
                    autoComplete="email"
                    autoFocus
                    invalid={invalid}
                    aria-describedby={describedBy}
                    {...register('email')}
                  />
                )}
              </Field>

              <Field label="Password" required error={errors.password?.message}>
                {({ id, invalid, describedBy }) => (
                  <div className="relative">
                    <Input
                      id={id}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      invalid={invalid}
                      aria-describedby={describedBy}
                      className="pr-11"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                )}
              </Field>

              <Button
                type="submit"
                variant="gradient"
                className="mt-1 w-full"
                loading={login.isPending}
              >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Seeded: admin@nexlor.test / owner@nexlor.test · Password123!
        </p>
      </div>
    </div>
  );
}
