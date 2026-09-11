import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl shadow-soft border border-line p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
