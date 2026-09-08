import { create } from 'zustand';
import type { SessionProgress } from '../services/session.service';

interface SessionStore {
  progress: SessionProgress | null;
  setProgress: (progress: SessionProgress) => void;
  clearProgress: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  progress: null,
  setProgress: (progress) => set({ progress }),
  clearProgress: () => set({ progress: null }),
}));
