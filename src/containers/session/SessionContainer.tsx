import { useEffect, useRef, useState, useCallback } from 'react';
import { SessionService } from '../../services/session.service';
import { TimerDisplay } from '../../components/session/TimerDisplay';
import { ProgressBar } from '../../components/session/ProgressBar';
import { MediaViewer } from '../../components/session/MediaViewer';
import { SessionControls } from '../../components/session/SessionControls';
import { useAudio } from '../../hooks/useAudio';
import { useWakeLock } from '../../hooks/useWakeLock';
import type { SessionProgress } from '../../services/session.service';
import type { Plan } from '../../models/plan.model';

interface SessionContainerProps {
  plan: Plan;
  onComplete: (duration: number, stagesCompleted: number) => void;
  onCancel: () => void;
}

export function SessionContainer({ plan, onComplete, onCancel }: SessionContainerProps) {
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const sessionRef = useRef<SessionService | null>(null);
  const { play, unlock } = useAudio();
  const previousStateRef = useRef<string>('idle');

  useWakeLock(true);

  useEffect(() => {
    const session = new SessionService();
    sessionRef.current = session;

    session.onTick((p) => {
      setProgress(p);

      // Play audio cues on state changes
      if (previousStateRef.current !== p.state) {
        if (p.state === 'stage-active' && previousStateRef.current !== 'idle') {
          play('stage-start');
        } else if (p.state === 'rest-period') {
          play('rest-start');
        }
        previousStateRef.current = p.state;
      }
    });

    session.onComplete((completedPlan, duration, stagesCompleted) => {
      play('session-complete');
      onComplete(duration, stagesCompleted);
    });

    // Unlock audio and start session
    unlock().then(() => {
      session.start(plan);
      play('stage-start');
      previousStateRef.current = 'stage-active';
    });

    return () => {
      session.stop();
    };
  }, [plan]);

  const handlePause = useCallback(() => {
    sessionRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    sessionRef.current?.resume();
  }, []);

  const handleSkipNext = useCallback(() => {
    sessionRef.current?.skipNext();
  }, []);

  const handleSkipPrevious = useCallback(() => {
    sessionRef.current?.skipPrevious();
  }, []);

  if (!progress) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-dark">
        <div className="text-white text-lg">Loading session...</div>
      </div>
    );
  }

  const isRest = progress.state === 'rest-period';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isRest ? 'bg-rest' : 'bg-surface-dark'}`}>
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <ProgressBar
          current={progress.currentStageIndex + 1}
          total={progress.totalStages}
        />

        <MediaViewer
          src={null} // TODO: Load from media service
          type={null}
          alt={progress.currentStage?.name ?? 'Exercise'}
        />

        {progress.currentStage && (
          <h2 className="text-white text-xl font-semibold">
            {progress.currentStage.name}
          </h2>
        )}

        <TimerDisplay
          timeRemaining={progress.timeRemaining}
          totalTime={progress.totalStageTime}
          isRest={isRest}
        />

        <SessionControls
          isPaused={progress.isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onSkipNext={handleSkipNext}
          onSkipPrevious={handleSkipPrevious}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
