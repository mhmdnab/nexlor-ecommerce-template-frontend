import type { Config } from 'tailwindcss';

/**
 * Shared Tailwind preset. Both apps extend this so the token system is applied
 * identically everywhere. Colors map to CSS variables (see tokens/theme.css);
 * `<alpha-value>` lets utilities like `bg-primary/10` work.
 */
const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`;

const preset: Omit<Config, 'content'> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: c('background'),
        surface: {
          DEFAULT: c('surface'),
          raised: c('surface-raised'),
          sunken: c('surface-sunken'),
        },
        border: c('border'),
        'border-strong': c('border-strong'),
        divider: c('divider'),
        foreground: c('foreground'),
        'muted-foreground': c('muted-foreground'),
        'subtle-foreground': c('subtle-foreground'),
        primary: {
          DEFAULT: c('primary'),
          foreground: c('primary-foreground'),
          hover: c('primary-hover'),
          active: c('primary-active'),
        },
        accent: { DEFAULT: c('accent'), foreground: c('accent-foreground') },
        'surface-inverse': {
          DEFAULT: c('surface-inverse'),
          foreground: c('surface-inverse-foreground'),
          muted: c('surface-inverse-muted'),
          border: c('surface-inverse-border'),
        },
        glass: { tint: c('glass-tint'), border: c('glass-border') },
        success: { DEFAULT: c('success'), foreground: c('success-foreground'), subtle: c('success-subtle') },
        warning: { DEFAULT: c('warning'), foreground: c('warning-foreground'), subtle: c('warning-subtle') },
        danger: { DEFAULT: c('danger'), foreground: c('danger-foreground'), subtle: c('danger-subtle') },
        info: { DEFAULT: c('info'), foreground: c('info-foreground'), subtle: c('info-subtle') },
        ring: c('ring'),
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-brand-soft': 'var(--gradient-brand-soft)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        lift: 'var(--shadow-lift)',
        glow: 'var(--shadow-glow)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'var(--font-sans-fallback)'],
        serif: ['var(--font-serif)', 'var(--font-serif-fallback)'],
      },
      fontSize: {
        // modular scale (rem) from the UI/UX prompt §1.2
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.15' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
      },
      spacing: {
        // strict 4/8 system is Tailwind's default; add section rhythm helpers
        18: '4.5rem',
        22: '5.5rem',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        reveal: 'var(--duration-reveal)',
      },
      zIndex: {
        sticky: '10',
        dropdown: '20',
        drawer: '40',
        modal: '100',
        toast: '1000',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'reveal-up': { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-base) var(--ease-standard)',
        'slide-in-right': 'slide-in-right var(--duration-slow) var(--ease-standard)',
        'slide-up': 'slide-up var(--duration-base) var(--ease-standard)',
        'reveal-up': 'reveal-up var(--duration-reveal) var(--ease-standard) both',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};

export default preset;
