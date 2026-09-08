import { create } from 'zustand';

interface SettingsStore {
  volume: number;
  soundEnabled: boolean;
  voiceCountdownEnabled: boolean;
  setVolume: (volume: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVoiceCountdownEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  volume: 1,
  soundEnabled: true,
  voiceCountdownEnabled: false,
  setVolume: (volume) => set({ volume }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVoiceCountdownEnabled: (voiceCountdownEnabled) => set({ voiceCountdownEnabled }),
}));
