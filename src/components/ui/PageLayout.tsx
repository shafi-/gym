import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  backgroundClass?: string;
}

/**
 * Mobile-first layout wrapper. On large screens the content is constrained
 * to a centered tab-width column instead of stretching full width. The inner
 * container animates in, giving every route change a 200ms slide.
 */
export function PageLayout({ children, backgroundClass = 'bg-base' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl animate-slide-in">
        {children}
      </div>
    </div>
  );
}
