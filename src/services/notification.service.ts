import { audioService } from './audio.service';
import { voiceService } from './voice.service';
import { AnnounceTracker } from './announce-tracker.service';
import { useSettingsStore } from '../stores/settings.store';
import type { SessionProgress } from './session.service';

type SoundId = 'stage-start' | 'stage-end' | 'rest-start' | 'rest-end' | 'session-complete' | 'countdown-beep';

export class NotificationService {
  private previousState: string = 'idle';
  private countdownBeeped: Set<number> = new Set();
  private announceTracker: AnnounceTracker;

  constructor() {
    this.announceTracker = new AnnounceTracker({
      announceStageName: true,
      announceStartStop: true,
      announceRest: true,
      announceCountdown: true,
      preStageWarningSeconds: 5,
    });
  }

  reset(): void {
    this.previousState = 'idle';
    this.countdownBeeped.clear();
    this.announceTracker.reset();
    voiceService.reset();
  }

  cleanup(): void {
    voiceService.stop();
  }

  notify(progress: SessionProgress): void {
    const { voiceEnabled } = useSettingsStore.getState();

    if (voiceEnabled) {
      this.announceTracker.announce(progress);
    } else {
      this.handleAudioNotification(progress);
    }
  }

  private handleAudioNotification(progress: SessionProgress): void {
    const { state, currentStageIndex, timeRemaining } = progress;

    if (this.previousState !== state) {
      if (state === 'stage-active' && this.previousState !== 'idle') {
        this.playSound('stage-start');
      } else if (state === 'rest-period') {
        this.playSound('rest-start');
      }
      this.countdownBeeped.clear();
      this.previousState = state;
    }

    if (state === 'stage-active' && timeRemaining <= 3 && timeRemaining > 0) {
      const beepKey = currentStageIndex * 1000 + timeRemaining;
      if (!this.countdownBeeped.has(beepKey)) {
        this.playSound('countdown-beep');
        this.countdownBeeped.add(beepKey);
      }
    }
  }

  private playSound(soundId: SoundId): void {
    const { volume, soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;
    audioService.setVolume(volume);
    audioService.play(soundId);
  }

  notifyComplete(): void {
    const { voiceEnabled } = useSettingsStore.getState();

    if (voiceEnabled) {
      this.announceTracker.speakCompletion();
    } else {
      this.playSound('session-complete');
    }
  }

  notifyStart(): void {
    const { voiceEnabled } = useSettingsStore.getState();

    if (!voiceEnabled) {
      this.playSound('stage-start');
    }
  }
}

export const notificationService = new NotificationService();
