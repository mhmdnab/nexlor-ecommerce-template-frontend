import { buttonVariants } from '@repo/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-32 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className={buttonVariants({ className: 'mt-6' })}>
        Back to home
      </Link>
    </div>
  );
}
