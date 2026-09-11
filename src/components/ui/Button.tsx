import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-500',
  secondary: 'bg-surface-2 text-ink hover:bg-line',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-danger text-danger-ink hover:opacity-90',
} as const;

// Min heights keep every button at/above the 44px touch-target floor
// (sm is reserved for dense inline affordances).
const sizes = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-[52px] px-6 text-base',
} as const;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
