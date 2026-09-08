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
      <div className="flex items-center gap-6">
        <button
          onClick={onSkipPrevious}
          className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl hover:bg-gray-600 transition-colors"
        >
          ⏮
        </button>

        <button
          onClick={isPaused ? onResume : onPause}
          className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl hover:bg-primary-700 transition-colors"
        >
          {isPaused ? '▶' : '⏸'}
        </button>

        <button
          onClick={onSkipNext}
          className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl hover:bg-gray-600 transition-colors"
        >
          ⏭
        </button>
      </div>

      <button
        onClick={onCancel}
        className="text-gray-400 text-sm hover:text-white transition-colors"
      >
        Cancel Session
      </button>
    </div>
  );
}
