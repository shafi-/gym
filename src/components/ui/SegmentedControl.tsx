import type { LucideIcon } from 'lucide-react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
}

/** iOS-style segmented control with radio semantics. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-1 p-1 bg-surface-2 rounded-xl"
    >
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex-1 min-h-10 inline-flex items-center justify-center gap-1.5 px-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              selected ? 'bg-surface text-ink shadow-soft' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {Icon && <Icon size={16} aria-hidden />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
