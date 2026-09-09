import { audioService } from './audio.service';
import { voiceService } from './voice.service';
import { useSettingsStore } from '../stores/settings.store';
import type { SessionProgress } from './session.service';

type SoundId = 'stage-start' | 'stage-end' | 'rest-start' | 'rest-end' | 'session-complete' | 'countdown-beep';

export class NotificationService {
  private previousState: string = 'idle';
  private countdownBeeped: Set<number> = new Set();

  /**
   * Reset tracking state (call when starting a new session)
   */
  reset(): void {
    this.previousState = 'idle';
    this.countdownBeeped.clear();
    voiceService.reset();
  }

  /**
   * Clean up when session ends
   */
  cleanup(): void {
    voiceService.stop();
  }

  /**
   * Main notification handler — call this on every session tick
   * Decides internally whether to play audio or voice
   */
  notify(progress: SessionProgress): void {
    const { voiceEnabled } = useSettingsStore.getState();

    if (voiceEnabled) {
      this.handleVoiceNotification(progress);
    } else {
      this.handleAudioNotification(progress);
    }
  }

  /**
   * Handle voice-based notifications
   */
  private handleVoiceNotification(progress: SessionProgress): void {
    voiceService.announce(progress, {
      announceStageName: true,
      announceStartStop: true,
      announceRest: true,
      announceCountdown: true,
      preStageWarningSeconds: 5,
    });
  }

  /**
   * Handle audio-based notifications (chimes and beeps)
   */
  private handleAudioNotification(progress: SessionProgress): void {
    const { state, currentStageIndex, timeRemaining } = progress;

    // Play audio cues on state changes
    if (this.previousState !== state) {
      if (state === 'stage-active' && this.previousState !== 'idle') {
        this.playSound('stage-start');
      } else if (state === 'rest-period') {
        this.playSound('rest-start');
      }
      this.countdownBeeped.clear();
      this.previousState = state;
    }

    // Countdown beep during last 3 seconds of a stage
    if (state === 'stage-active' && timeRemaining <= 3 && timeRemaining > 0) {
      const beepKey = currentStageIndex * 1000 + timeRemaining;
      if (!this.countdownBeeped.has(beepKey)) {
        this.playSound('countdown-beep');
        this.countdownBeeped.add(beepKey);
      }
    }
  }

  /**
   * Play a sound effect
   */
  private playSound(soundId: SoundId): void {
    const { volume, soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;
    audioService.setVolume(volume);
    audioService.play(soundId);
  }

  /**
   * Notify session complete
   */
  notifyComplete(): void {
    const { voiceEnabled } = useSettingsStore.getState();

    if (voiceEnabled) {
      voiceService.speak('Workout complete!', 'high');
    } else {
      this.playSound('session-complete');
    }
  }

  /**
   * Notify session start
   */
  notifyStart(): void {
    const { voiceEnabled } = useSettingsStore.getState();

    if (!voiceEnabled) {
      this.playSound('stage-start');
    }
    // Voice announcement for first stage is handled by notify() on first tick
  }
}

// Singleton instance
export const notificationService = new NotificationService();
