import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button class variants — kept in a NON-client module so it can be called from
 * server components too (e.g. styling a <Link> as a button during prerender).
 */
export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ' +
    'transition-[transform,background-color,color,box-shadow] duration-fast ease-standard ' +
    'touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:-translate-y-0.5 active:bg-primary-active',
        gradient:
          'bg-gradient-brand text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:brightness-110',
        secondary:
          'bg-surface text-foreground border border-border-strong hover:bg-surface-sunken hover:-translate-y-0.5',
        ghost: 'text-foreground hover:bg-surface-sunken',
        destructive: 'bg-danger text-danger-foreground shadow-sm hover:opacity-90',
        link: 'text-primary underline-offset-4 hover:underline px-0 h-auto min-h-0',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
