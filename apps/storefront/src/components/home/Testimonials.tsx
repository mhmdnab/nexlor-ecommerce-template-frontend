import { Eyebrow, Reveal } from '@repo/ui';
import { Star } from 'lucide-react';

const QUOTES = [
  {
    quote: 'The quality is genuinely exceptional. Everything I’ve bought has become a staple.',
    name: 'Amara O.',
    detail: 'Verified buyer',
  },
  {
    quote: 'Beautifully made and it arrived faster than I expected. The packaging alone felt premium.',
    name: 'Daniel R.',
    detail: 'Verified buyer',
  },
  {
    quote: 'I keep coming back. Timeless pieces that don’t go out of style — exactly what I wanted.',
    name: 'Priya S.',
    detail: 'Verified buyer',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 text-center">
        <Eyebrow>Loved by customers</Eyebrow>
        <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Worn, kept, recommended
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delayIndex={i}>
            <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex gap-0.5 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed text-foreground">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-medium text-foreground">{q.name}</span>
                <span className="text-muted-foreground"> · {q.detail}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
