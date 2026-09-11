import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { IconButton } from './IconButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  /** 'brand' = flat indigo block (home); 'plain' = themed surface. */
  variant?: 'plain' | 'brand';
}

/**
 * The single shared header for all screens: back affordance, title, and
 * action slot with 44px touch targets and a consistent height.
 */
export function ScreenHeader({ title, subtitle, onBack, actions, variant = 'plain' }: ScreenHeaderProps) {
  const isBrand = variant === 'brand';
  return (
    <header
      className={`sticky top-0 z-20 pt-[env(safe-area-inset-top)] ${
        isBrand ? 'bg-primary-600 text-white' : 'bg-surface text-ink border-b border-line'
      }`}
    >
      <div className="flex items-center gap-1 h-14 px-2">
        {onBack && (
          <IconButton
            label="Back"
            onClick={onBack}
            className={isBrand ? 'text-brand-ink hover:bg-white/15' : undefined}
          >
            <ChevronLeft size={22} />
          </IconButton>
        )}
        <div className="flex-1 min-w-0 px-1">
          <h1
            className={`truncate font-bold ${isBrand ? 'text-xl' : 'text-lg font-semibold'} ${
              subtitle ? '' : 'leading-tight'
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`text-xs truncate ${isBrand ? 'text-white/70' : 'text-ink-3'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 pr-1">{actions}</div>
      </div>
    </header>
  );
}
