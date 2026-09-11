import type { ReactNode } from 'react';

interface BottomActionBarProps {
  children: ReactNode;
}

/**
 * Sticky thumb-reach action bar (primary actions live in the bottom 25% of
 * the screen per the app's touch-first guidelines).
 */
export function BottomActionBar({ children }: BottomActionBarProps) {
  return (
    <div className="sticky bottom-0 z-20 mt-6 bg-surface/95 backdrop-blur border-t border-line px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] animate-slide-up">
      {children}
    </div>
  );
}
