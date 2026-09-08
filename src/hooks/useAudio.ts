import { useCallback } from 'react';
import { audioService } from '../services/audio.service';
import { useSettingsStore } from '../stores/settings.store';

export function useAudio() {
  const { volume, soundEnabled } = useSettingsStore();

  const unlock = useCallback(async () => {
    await audioService.unlock();
  }, []);

  const play = useCallback(
    (soundId: 'stage-start' | 'stage-end' | 'rest-start' | 'rest-end' | 'session-complete' | 'countdown-beep') => {
      if (!soundEnabled) return;
      audioService.setVolume(volume);
      audioService.play(soundId);
    },
    [soundEnabled, volume]
  );

  return { unlock, play, isUnlocked: audioService.isUnlocked() };
}
