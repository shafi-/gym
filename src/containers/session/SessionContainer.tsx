import { useEffect, useRef, useState, useCallback } from 'react';
import { SessionService } from '../../services/session.service';
import { MediaService } from '../../services/media.service';
import { TimerDisplay } from '../../components/session/TimerDisplay';
import { ProgressBar } from '../../components/session/ProgressBar';
import { MediaViewer } from '../../components/session/MediaViewer';
import { SessionControls } from '../../components/session/SessionControls';
import { SessionGate } from '../../components/session/SessionGate';
import { useAudio } from '../../hooks/useAudio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { notificationService } from '../../services/notification.service';
import { audioService } from '../../services/audio.service';
import { voiceService } from '../../services/voice.service';
import { Toast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
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
  // One SessionService per component instance, created lazily. Creating it
  // inside the effect made StrictMode's simulate-unmount/remount destroy and
  // recreate a running session — the churn behind the double first-stage
  // announcement.
  const sessionRef = useRef<SessionService | null>(null);
  if (sessionRef.current === null) {
    sessionRef.current = new SessionService();
  }
  const mediaService = new MediaService();
  const { unlock } = useAudio();
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  // Gate is skipped only when audio was already unlocked inside a real user
  // gesture this document load (warm navigation). Otherwise it stays up until
  // the user taps Start — no heuristic guessing, verified state only.
  const [isGated, setIsGated] = useState(!audioService.isUnlocked());

  // Refs to prevent double-initialization in React StrictMode
  const hasInitializedRef = useRef(false);
  const prevPlanIdRef = useRef<string | null>(null);

  // Debug: show toast when voice announces something
  useEffect(() => {
    voiceService.setOnAnnounceCallback((text) => {
      setVoiceToast(text);
    });
    return () => {
      voiceService.setOnAnnounceCallback(() => {});
    };
  }, []);

  // Haptic tick on every stage/rest transition (Android; no-op elsewhere).
  const transitionKey = progress
    ? `${progress.state}:${progress.currentStageIndex}:${progress.currentStage?.id ?? ''}`
    : null;
  const lastBuzzKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!transitionKey || transitionKey === lastBuzzKeyRef.current) return;
    lastBuzzKeyRef.current = transitionKey;
    navigator.vibrate?.(30);
  }, [transitionKey]);

  useWakeLock(true);

  // Load media when stage changes
  useEffect(() => {
    const mediaId = progress?.currentStage?.mediaId;
    if (!mediaId) {
      setMediaSrc(null);
      setMediaType(null);
      return;
    }
    const id: string = mediaId;

    let revoked = false;
    let objectUrl: string | null = null;

    async function loadMedia() {
      const media = await mediaService.getMediaById(id);
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
    const session = sessionRef.current!;

    session.onTick((p) => {
      setProgress(p);
      notificationService.notify(p);
    });

    session.onComplete((_completedPlan, duration, stagesCompleted) => {
      notificationService.notifyComplete();
      setSessionResult({ duration, stagesCompleted });
    });

    // Reset notification state when plan changes (not on re-mount). Refs
    // survive StrictMode's simulated remount, so the second effect pass does
    // NOT reset here — the announce tracker's baseline survives the restart.
    if (prevPlanIdRef.current !== plan.id) {
      notificationService.reset();
      prevPlanIdRef.current = plan.id;
    }

    // Session start is deferred to the SessionGate tap (handleReady) — it is
    // the user gesture browsers require for audio and speech synthesis. The
    // only exception: warm navigation already unlocked audio in its own
    // gesture, so the gate auto-skipped and the session starts here.
    if (!audioService.isUnlocked()) return;

    // notifyStart is guarded once per component instance; session.start() on
    // an already-stopped instance is a plain restart and stays silent for the
    // first stage, because the tracker ignores teardown ticks (stop()'s
    // 'idle' notification) and keeps its baseline.
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      notificationService.notifyStart();
    }
    session.start(plan);

    return () => {
      session.stop();
      notificationService.cleanup();
    };
  }, [plan]);

  /** Runs synchronously inside the gate's onClick — that gesture is what
   * unlocks audio. Must not await before session.start(). */
  const handleReady = useCallback(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setIsGated(false);
    void unlock();
    voiceService.prime();
    notificationService.notifyStart();
    sessionRef.current?.start(plan);
  }, [plan, unlock]);

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

  const handleFinishSession = useCallback(() => {
    if (sessionResult) {
      onComplete(sessionResult.duration, sessionResult.stagesCompleted);
    }
  }, [sessionResult, onComplete]);

  if (isGated) {
    return (
      <SessionGate
        planName={plan.name}
        stageCount={plan.stages.length}
        onReady={handleReady}
      />
    );
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center h-screen bg-night">
        <Spinner />
      </div>
    );
  }

  // Show completion screen
  if (progress.state === 'completed' && sessionResult) {
    const minutes = Math.floor(sessionResult.duration / 60);
    const seconds = sessionResult.duration % 60;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-night animate-fade-in">
        <div className="text-center max-w-sm">
          <span className="text-7xl mb-6 block animate-bounce" aria-hidden>
            🎉
          </span>
          <h1 className="text-3xl font-bold text-night-ink mb-3">Session Complete!</h1>
          <p className="text-night-ink-2 text-lg mb-1">{plan.name}</p>
          <div className="flex justify-center gap-4 mt-6 mb-8">
            <div className="text-center bg-night-surface rounded-xl px-6 py-3">
              <p className="text-2xl font-bold text-night-ink tabular">{sessionResult.stagesCompleted}</p>
              <p className="text-sm text-night-ink-2">stages</p>
            </div>
            <div className="text-center bg-night-surface rounded-xl px-6 py-3">
              <p className="text-2xl font-bold text-night-ink tabular">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-night-ink-2">duration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinishSession}
            className="w-full min-h-[56px] bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-500 transition-colors active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const isRest = progress.state === 'rest-period';
  const nextStage = isRest ? plan.stages[progress.currentStageIndex + 1] : null;
  const isUrgent = progress.timeRemaining <= 10;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isRest ? 'bg-rest' : 'bg-night'}`}>
      {/* Screen-reader announcement for stage transitions. */}
      <div className="sr-only" aria-live="polite">
        {progress.currentStage
          ? isRest
            ? `Rest. Up next: ${nextStage?.name ?? ''}`
            : `Stage ${progress.currentStageIndex + 1}: ${progress.currentStage.name}`
          : ''}
      </div>
      <div
        key={transitionKey ?? 'idle'}
        className="w-full max-w-md flex flex-col items-center gap-5 animate-stage-fade"
      >
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
          <h2 className="text-night-ink text-2xl font-semibold text-center">
            {progress.currentStage.name}
          </h2>
        )}

        {isRest && nextStage && (
          <p className="text-night-ink-2 text-sm -mt-3">
            Up next: <span className="font-medium text-night-ink">{nextStage.name}</span>
          </p>
        )}

        <TimerDisplay
          timeRemaining={progress.timeRemaining}
          totalTime={progress.totalStageTime}
          isRest={isRest}
          isUrgent={isUrgent}
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
      {voiceToast && (
        <Toast
          message={voiceToast}
          tone="info"
          onDismiss={() => setVoiceToast(null)}
        />
      )}
    </div>
  );
}
