import { useCallback, useEffect } from 'react';
import { voiceService } from '../services/voice.service';
import { useSettingsStore } from '../stores/settings.store';

/**
 * useVoice — React hook for VoiceService lifecycle management.
 *
 * Responsibility: Toggle voice service enable/disable based on settings.
 * Does NOT handle announcement logic — that's AnnounceTracker's job.
 */
export function useVoice() {
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);

  useEffect(() => {
    voiceService.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  const reset = useCallback(() => {
    voiceService.reset();
  }, []);

  const stop = useCallback(() => {
    voiceService.stop();
  }, []);

  const prime = useCallback(() => {
    voiceService.prime();
  }, []);

  return {
    reset,
    stop,
    prime,
    isSupported: voiceService.isSupported(),
    isSpeaking: () => voiceService.isSpeaking(),
  };
}
