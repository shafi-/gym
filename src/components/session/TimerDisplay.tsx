interface TimerDisplayProps {
  timeRemaining: number;
  totalTime: number;
  isRest: boolean;
  isUrgent?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const RING_LENGTH = 283; // circumference of r=45 circle

export function TimerDisplay({ timeRemaining, totalTime, isRest, isUrgent = false }: TimerDisplayProps) {
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

  const ringClass = isUrgent ? 'stroke-danger' : isRest ? 'stroke-rest' : 'stroke-brand';
  const textClass = isUrgent ? 'text-danger' : 'text-night-ink';

  return (
    <div className="flex flex-col items-center gap-4">
      {isRest && (
        <span className="text-rest font-semibold text-sm uppercase tracking-widest animate-fade-in">
          Rest
        </span>
      )}
      <div className={`relative w-56 h-56 ${isUrgent ? 'animate-pulse-urgent' : ''}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="45" fill="none" className="stroke-night-line" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="6"
            strokeDasharray={`${progress * RING_LENGTH} ${RING_LENGTH}`}
            strokeLinecap="round"
            className={`${ringClass} transition-all duration-300`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            role="timer"
            aria-label={`${formatTime(timeRemaining)} remaining`}
            className={`text-[56px] leading-none font-mono tabular font-bold ${textClass}`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
