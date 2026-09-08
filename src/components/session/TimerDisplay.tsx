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

export function TimerDisplay({ timeRemaining, totalTime, isRest, isUrgent = false }: TimerDisplayProps) {
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {isRest && (
        <span className="text-rest font-semibold text-lg uppercase tracking-wide">
          Rest
        </span>
      )}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isUrgent ? '#EF4444' : isRest ? '#3B82F6' : '#4F46E5'}
            strokeWidth="6"
            strokeDasharray={`${progress * 283} 283`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-4xl font-mono font-bold ${isUrgent ? 'text-red-400' : 'text-white'} ${isUrgent ? 'animate-pulse' : ''}`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
