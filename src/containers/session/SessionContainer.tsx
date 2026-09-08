import { useEffect, useRef, useState, useCallback } from 'react';
import { SessionService } from '../../services/session.service';
import { MediaService } from '../../services/media.service';
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
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [sessionResult, setSessionResult] = useState<{ duration: number; stagesCompleted: number } | null>(null);
  const sessionRef = useRef<SessionService | null>(null);
  const mediaService = new MediaService();
  const { play, unlock } = useAudio();
  const previousStateRef = useRef<string>('idle');

  useWakeLock(true);

  // Load media when stage changes
  useEffect(() => {
    if (!progress?.currentStage?.mediaId) {
      setMediaSrc(null);
      setMediaType(null);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    async function loadMedia() {
      const media = await mediaService.getMediaById(progress.currentStage!.mediaId!);
      if (revoked || !media) return;

      objectUrl = URL.createObjectURL(media.blob);
      setMediaSrc(objectUrl);
      setMediaType(media.mimeType.startsWith('video') ? 'video' : 'image');
    }

    loadMedia();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [progress?.currentStage?.mediaId]);

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
      setSessionResult({ duration, stagesCompleted });
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

  // Show completion screen
  if (progress.state === 'completed' && sessionResult) {
    const minutes = Math.floor(sessionResult.duration / 60);
    const seconds = sessionResult.duration % 60;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-dark">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎉</span>
          <h1 className="text-2xl font-bold text-white mb-2">Session Complete!</h1>
          <p className="text-gray-400 mb-1">{plan.name}</p>
          <p className="text-gray-400">
            {sessionResult.stagesCompleted} stages · {minutes}m {seconds}s
          </p>
        </div>
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
          src={mediaSrc}
          type={mediaType}
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
