interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-night-ink-2 mb-1.5 tabular">
        <span>
          Stage {current} of {total}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div
        className="h-2 bg-night-surface rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Stage ${current} of ${total}`}
      >
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
