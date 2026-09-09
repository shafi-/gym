import { create } from 'zustand';

interface SettingsStore {
  volume: number;
  soundEnabled: boolean;
  voiceCountdownEnabled: boolean;

  // Voice guidance settings
  voiceEnabled: boolean;
  voiceRate: number;
  voicePitch: number;

  // Announcement toggles
  announceStageName: boolean;
  announceStartStop: boolean;
  announceRest: boolean;
  announceCountdown: boolean;

  // Timing
  preStageWarningSeconds: number;

  // Voice selection
  selectedVoiceURI: string;

  setVolume: (volume: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVoiceCountdownEnabled: (enabled: boolean) => void;

  // Voice setters
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setAnnounceStageName: (enabled: boolean) => void;
  setAnnounceStartStop: (enabled: boolean) => void;
  setAnnounceRest: (enabled: boolean) => void;
  setAnnounceCountdown: (enabled: boolean) => void;
  setPreStageWarningSeconds: (seconds: number) => void;
  setSelectedVoiceURI: (uri: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  volume: 1,
  soundEnabled: true,
  voiceCountdownEnabled: false,

  // Voice defaults
  voiceEnabled: true,
  voiceRate: 1.0,
  voicePitch: 1.0,

  // Announcement defaults
  announceStageName: true,
  announceStartStop: true,
  announceRest: true,
  announceCountdown: true,

  // Timing defaults
  preStageWarningSeconds: 5,

  // Voice selection
  selectedVoiceURI: '',

  setVolume: (volume) => set({ volume }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVoiceCountdownEnabled: (voiceCountdownEnabled) => set({ voiceCountdownEnabled }),

  // Voice setters
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
  setVoiceRate: (voiceRate) => set({ voiceRate }),
  setVoicePitch: (voicePitch) => set({ voicePitch }),
  setAnnounceStageName: (announceStageName) => set({ announceStageName }),
  setAnnounceStartStop: (announceStartStop) => set({ announceStartStop }),
  setAnnounceRest: (announceRest) => set({ announceRest }),
  setAnnounceCountdown: (announceCountdown) => set({ announceCountdown }),
  setPreStageWarningSeconds: (preStageWarningSeconds) => set({ preStageWarningSeconds }),
  setSelectedVoiceURI: (selectedVoiceURI) => set({ selectedVoiceURI }),
}));
