import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name — IconButton is icon-only by definition. */
  label: string;
  children: ReactNode;
  variant?: 'standard' | 'danger';
  size?: 'md' | 'lg';
}

const variants = {
  standard: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'text-danger hover:bg-danger-soft',
} as const;

const sizes = {
  md: 'w-11 h-11',
  lg: 'w-12 h-12',
} as const;

/** Square icon-only button with a 44px (or larger) touch target. */
export function IconButton({
  label,
  children,
  variant = 'standard',
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full transition-colors duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
