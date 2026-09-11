import { Headphones } from 'lucide-react';

interface SessionGateProps {
  planName: string;
  stageCount: number;
  onReady: () => void;
}

/**
 * Pre-session gesture gate. Browsers only allow audio (and speech synthesis
 * on iOS) to start from a user gesture, and gesture-less entries into the
 * session route (deep link, PWA relaunch, refresh) have none. The tap on the
 * Start button synchronously unlocks audio, then starts the session.
 */
export function SessionGate({ planName, stageCount, onReady }: SessionGateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-night animate-fade-in">
      <div className="text-center max-w-sm w-full">
        <span className="w-20 h-20 mx-auto mb-5 bg-night-surface rounded-full flex items-center justify-center" aria-hidden>
          <Headphones size={32} className="text-brand" />
        </span>
        <h1 className="text-2xl font-bold text-night-ink mb-2">Ready?</h1>
        <p className="text-night-ink-2 mb-8 tabular">
          {planName} · {stageCount} stages. Tap start to enable voice coaching and sounds.
        </p>
        <button
          type="button"
          onClick={onReady}
          className="w-full min-h-[56px] bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-500 transition-colors active:scale-[0.98]"
        >
          Start
        </button>
      </div>
    </div>
  );
}
