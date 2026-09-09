import type { SessionProgress } from './session.service';
import { voiceService } from './voice.service';
import { audioService } from './audio.service';

export interface AnnounceOptions {
  announceStageName: boolean;
  announceStartStop: boolean;
  announceRest: boolean;
  announceCountdown: boolean;
  preStageWarningSeconds: number;
}

export class AnnounceTracker {
  private lastState: SessionProgress['state'] | null = null;
  private lastStageIndex: number = -1;
  private countdownSpoken: Set<number> = new Set();
  private preStageWarningSpoken: boolean = false;

  constructor(private readonly defaultOptions: AnnounceOptions) {}

  public reset(): void {
    this.lastState = null;
    this.lastStageIndex = -1;
    this.countdownSpoken.clear();
    this.preStageWarningSpoken = false;
  }

  public announce(progress: SessionProgress, options: Partial<AnnounceOptions> = {}): void {
    const opts: AnnounceOptions = { ...this.defaultOptions, ...options };
    const { state, currentStageIndex, isPaused } = progress;

    // Teardown/terminal states are not announcement events (see
    // handleStateChange: only stage-active and rest-period are spoken).
    // Importantly they must not reset the baseline either: stop() emits an
    // 'idle' tick as part of its observer contract, and a subsequent restart
    // (e.g. StrictMode's simulate-unmount/remount) would otherwise look like
    // a brand-new stage-active event and re-announce the first stage.
    if (state === 'idle' || state === 'completed') return;

    if (state !== this.lastState || currentStageIndex !== this.lastStageIndex) {
      this.handleStateChange(progress, opts);
      this.lastState = state;
      this.lastStageIndex = currentStageIndex;
      this.countdownSpoken.clear();
      this.preStageWarningSpoken = false;
      return;
    }

    if (!isPaused) {
      if (state === 'rest-period' && opts.preStageWarningSeconds > 0) {
        this.handlePreStageWarning(progress, opts.preStageWarningSeconds);
      }
      if (state === 'stage-active' && opts.announceCountdown) {
        this.handleCountdown(progress);
      }
    }
  }

  private handleStateChange(progress: SessionProgress, opts: AnnounceOptions): void {
    const { state, currentStage, timeRemaining } = progress;

    switch (state) {
      case 'stage-active':
        if (currentStage && opts.announceStageName) {
          const name = currentStage.name;
          if (opts.announceStartStop) {
            voiceService.speak(name + '. Go!', 'high');
            this.playBeepCountdown(3);
          } else {
            voiceService.speak(name, 'high');
          }
        }
        break;

      case 'rest-period':
        if (opts.announceRest) {
          voiceService.speak('Take rest ' + timeRemaining + ' seconds', 'normal');
          this.playBeepCountdown(3);
        }
        break;
      // NOTE: session completion is announced via notifyComplete() →
      // speakCompletion(). We intentionally do NOT speak here, otherwise the
      // trailing notifyTick() after completeSession() would announce twice.
    }
  }

  /**
   * Speak completion message. Goes through AnnounceTracker so that
   * double-mount in StrictMode won't cause double announcement.
   */
  public speakCompletion(): void {
    voiceService.speak('Congratulations, you did it!', 'high');
  }

  private handlePreStageWarning(progress: SessionProgress, warningSeconds: number): void {
    const { timeRemaining, nextStage } = progress;
    // During rest, currentStageIndex still points at the stage that just
    // finished, so always announce the NEXT stage here.
    if (!nextStage) return;

    const estimatedSpeechDuration = 3;
    const triggerAt = warningSeconds + estimatedSpeechDuration;

    if (timeRemaining <= triggerAt && timeRemaining > estimatedSpeechDuration) {
      if (!this.preStageWarningSpoken) {
        this.preStageWarningSpoken = true;
        voiceService.speak(nextStage.name + ' in ' + Math.max(1, timeRemaining - estimatedSpeechDuration) + ' seconds', 'normal');
        this.playBeepCountdown(3);
      }
    } else {
      // Reset flag when we move out of the warning window
      this.preStageWarningSpoken = false;
    }
  }

  private handleCountdown(progress: SessionProgress): void {
    const { timeRemaining, currentStage } = progress;
    if (!currentStage) return;

    if (timeRemaining <= 3 && timeRemaining >= 1 && timeRemaining === Math.floor(timeRemaining)) {
      if (!this.countdownSpoken.has(timeRemaining)) {
        this.countdownSpoken.add(timeRemaining);
        voiceService.speak(String(timeRemaining), 'low');
      }
    }
  }

  private playBeepCountdown(count: number): void {
    for (let i = count; i >= 1; i--) {
      setTimeout(() => {
        audioService.playBeep();
      }, (count - i) * 1000);
    }
  }
}
