import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'id'> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Format the value shown next to the label (defaults to the raw number). */
  formatValue?: (value: number) => string;
}

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
  className = '',
}: SliderProps) {
  const id = useId();
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1.5">
          <label htmlFor={id} className="text-sm text-ink-2">
            {label}
          </label>
          <span className="text-sm font-semibold text-ink tabular">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <input
        id={id}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider w-full cursor-pointer"
      />
    </div>
  );
}
