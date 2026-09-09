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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center max-w-sm">
          <span className="text-7xl mb-6 block animate-bounce">🎉</span>
          <h1 className="text-3xl font-bold text-white mb-3">Session Complete!</h1>
          <p className="text-purple-200 text-lg mb-1">{plan.name}</p>
          <div className="flex justify-center gap-6 mt-4 mb-8">
            <div className="text-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{sessionResult.stagesCompleted}</p>
              <p className="text-sm text-purple-200">stages</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{minutes}:{seconds.toString().padStart(2, '0')}</p>
              <p className="text-sm text-purple-200">duration</p>
            </div>
          </div>
          <button
            onClick={handleFinishSession}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
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
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isRest ? 'bg-rest' : 'bg-surface-dark'}`}>
      <div className="w-full max-w-md flex flex-col items-center gap-5">
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
          <h2 className="text-white text-xl font-semibold text-center">
            {progress.currentStage.name}
          </h2>
        )}

        {isRest && nextStage && (
          <p className="text-blue-200 text-sm">
            Up next: <span className="font-medium text-white">{nextStage.name}</span>
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
          message={`🔊 ${voiceToast}`}
          tone="success"
          onDismiss={() => setVoiceToast(null)}
        />
      )}
    </div>
  );
}
