import { buttonVariants, cn, Eyebrow, Reveal } from '@repo/ui';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Lookbook() {
  return (
    <section className="py-16 sm:py-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl">
          <Image
            src="https://picsum.photos/seed/nx-lookbook/1600/900"
            alt="The 2026 lookbook — considered essentials, photographed in natural light"
            width={1600}
            height={900}
            sizes="100vw"
            className="h-[60vh] min-h-[24rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-14">
            <Eyebrow className="text-white/80">The 2026 lookbook</Eyebrow>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-12 bg-gold" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                Editorial
              </span>
            </div>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold text-white sm:text-5xl">
              Light, texture, and things worth keeping.
            </h2>
            <p className="mt-4 max-w-md text-base text-white/80">
              A season of quiet essentials, photographed the way they’re meant to be lived in.
            </p>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mt-8 w-fit bg-surface text-foreground shadow-sm hover:bg-surface-sunken',
              )}
            >
              Explore the lookbook
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
