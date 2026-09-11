/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand scale (kept for tints/rings); semantic roles come from CSS vars.
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        base: 'rgb(var(--c-base) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          2: 'rgb(var(--c-ink-2) / <alpha-value>)',
          3: 'rgb(var(--c-ink-3) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          strong: 'rgb(var(--c-brand-strong) / <alpha-value>)',
          soft: 'rgb(var(--c-brand-soft) / <alpha-value>)',
          ink: 'rgb(var(--c-brand-ink) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--c-success) / <alpha-value>)',
          soft: 'rgb(var(--c-success-soft) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--c-danger) / <alpha-value>)',
          soft: 'rgb(var(--c-danger-soft) / <alpha-value>)',
          ink: 'rgb(var(--c-danger-ink) / <alpha-value>)',
        },
        rest: {
          DEFAULT: 'rgb(var(--c-rest) / <alpha-value>)',
          soft: 'rgb(var(--c-rest-soft) / <alpha-value>)',
        },
        scrim: 'rgb(var(--c-scrim) / <alpha-value>)',
        'type-hiit': {
          DEFAULT: 'rgb(var(--c-type-hiit) / <alpha-value>)',
          soft: 'rgb(var(--c-type-hiit-soft) / <alpha-value>)',
        },
        'type-strength': {
          DEFAULT: 'rgb(var(--c-type-strength) / <alpha-value>)',
          soft: 'rgb(var(--c-type-strength-soft) / <alpha-value>)',
        },
        'type-yoga': {
          DEFAULT: 'rgb(var(--c-type-yoga) / <alpha-value>)',
          soft: 'rgb(var(--c-type-yoga-soft) / <alpha-value>)',
        },
        // Fixed immersive-dark tokens for the session player (theme-independent).
        night: {
          DEFAULT: 'rgb(var(--c-night) / <alpha-value>)',
          surface: 'rgb(var(--c-night-surface) / <alpha-value>)',
          line: 'rgb(var(--c-night-line) / <alpha-value>)',
          ink: 'rgb(var(--c-night-ink) / <alpha-value>)',
          'ink-2': 'rgb(var(--c-night-ink-2) / <alpha-value>)',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--c-scrim) / 0.04), 0 4px 16px rgb(var(--c-scrim) / 0.06)',
        lift: '0 8px 24px rgb(var(--c-scrim) / 0.16)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'stage-fade': {
          from: { opacity: '0', transform: 'scale(0.99)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-urgent': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.025)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'stage-fade': 'stage-fade 300ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        'slide-in': 'slide-in 200ms ease-out',
        'pulse-urgent': 'pulse-urgent 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
