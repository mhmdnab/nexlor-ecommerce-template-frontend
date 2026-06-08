import { Eyebrow, Reveal } from '@repo/ui';
import { Leaf, Hammer, Truck } from 'lucide-react';

const VALUES = [
  {
    icon: Leaf,
    title: 'Sustainably sourced',
    body: 'Materials chosen for longevity and a lighter footprint — never fast fashion.',
  },
  {
    icon: Hammer,
    title: 'Crafted to last',
    body: 'Made by people who care, with details that hold up to everyday life.',
  },
  {
    icon: Truck,
    title: 'Carbon-neutral delivery',
    body: 'Every order ships carbon-neutral, with 30-day no-questions returns.',
  },
];

export function ValuesTrio() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 text-center">
        <Eyebrow>Why Nexlor</Eyebrow>
        <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Made with intention
        </h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delayIndex={i}>
            <div className="flex flex-col items-center px-4 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-subtle text-gold">
                <v.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-serif text-xl font-semibold text-foreground">{v.title}</h3>
              <span className="mt-3 h-px w-8 bg-gold" aria-hidden />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
