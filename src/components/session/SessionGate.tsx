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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-dark">
      <div className="text-center max-w-sm w-full">
        <span className="text-6xl mb-4 block">🎧</span>
        <h1 className="text-2xl font-bold text-white mb-2">Ready?</h1>
        <p className="text-gray-400 mb-8">
          {planName} · {stageCount} stages. Tap start to enable voice coaching and sounds.
        </p>
        <button
          onClick={onReady}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
        >
          Start
        </button>
      </div>
    </div>
  );
}
