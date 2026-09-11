import type { ReactNode } from 'react';

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** Selectable filter pill with proper pressed state for assistive tech. */
export function Chip({ selected, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
        selected
          ? 'bg-brand-soft text-brand border-brand/40'
          : 'bg-surface-2 text-ink-2 border-transparent hover:bg-line hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
