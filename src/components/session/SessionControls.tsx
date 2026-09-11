import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';

interface SessionControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onCancel: () => void;
}

export function SessionControls({
  isPaused,
  onPause,
  onResume,
  onSkipNext,
  onSkipPrevious,
  onCancel,
}: SessionControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Previous stage"
          onClick={onSkipPrevious}
          className="w-14 h-14 rounded-full bg-night-surface text-night-ink flex items-center justify-center hover:bg-night-line transition-colors active:scale-95"
        >
          <SkipBack size={22} aria-hidden />
        </button>

        <button
          type="button"
          aria-label={isPaused ? 'Resume' : 'Pause'}
          onClick={isPaused ? onResume : onPause}
          className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-500 transition-colors active:scale-95"
        >
          {isPaused ? <Play size={32} aria-hidden /> : <Pause size={32} aria-hidden />}
        </button>

        <button
          type="button"
          aria-label="Next stage"
          onClick={onSkipNext}
          className="w-14 h-14 rounded-full bg-night-surface text-night-ink flex items-center justify-center hover:bg-night-line transition-colors active:scale-95"
        >
          <SkipForward size={22} aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-night-ink-2 text-sm hover:text-night-ink transition-colors min-h-11 px-3"
      >
        Cancel Session
      </button>
    </div>
  );
}
