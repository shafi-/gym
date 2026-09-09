import { useCallback, useEffect, useRef } from 'react';
import { voiceService } from '../services/voice.service';
import { useSettingsStore } from '../stores/settings.store';
import type { SessionProgress } from '../services/session.service';

export function useVoice() {
  const { voiceEnabled } = useSettingsStore();
  const previousStateRef = useRef<string>('idle');
  const previousStageRef = useRef<number>(-1);

  useEffect(() => {
    voiceService.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  const announce = useCallback(async (progress: SessionProgress) => {
    if (!voiceEnabled) return;

    await voiceService.ensureReady();
    voiceService.announce(progress, {
      announceStageName: true,
      announceStartStop: true,
      announceRest: true,
      announceCountdown: true,
      preStageWarningSeconds: 5,
    });
  }, [voiceEnabled]);

  const reset = useCallback(() => {
    voiceService.reset();
    previousStateRef.current = 'idle';
    previousStageRef.current = -1;
  }, []);

  const stop = useCallback(() => {
    voiceService.stop();
  }, []);

  return {
    announce,
    reset,
    stop,
    isSupported: voiceService.isSupported(),
    isSpeaking: () => voiceService.isSpeaking(),
  };
}
