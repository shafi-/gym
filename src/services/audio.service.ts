type SoundId = 'stage-start' | 'stage-end' | 'rest-start' | 'rest-end' | 'session-complete' | 'countdown-beep';

/** Autoplay policy can leave resume() pending forever; bound the unlock wait. */
const UNLOCK_TIMEOUT_MS = 500;

export class AudioService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundId, HTMLAudioElement> = new Map();
  private volume: number = 1;
  private unlocked: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    const soundFiles: Record<SoundId, string> = {
      'stage-start': '/audio/stage-start.wav',
      'stage-end': '/audio/stage-end.wav',
      'rest-start': '/audio/rest-start.wav',
      'rest-end': '/audio/rest-end.wav',
      'session-complete': '/audio/session-complete.wav',
      'countdown-beep': '/audio/beep.wav',
    };

    for (const [id, path] of Object.entries(soundFiles)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.load();
      this.sounds.set(id as SoundId, audio);
    }
  }

  /**
   * Best-effort unlock of Web Audio playback. Under Chrome's autoplay policy
   * `resume()` made without a user gesture stays pending forever, so the race
   * below bounds the wait; call again after a user gesture to finish unlocking.
   */
  async unlock(): Promise<void> {
    if (this.audioContext?.state === 'running') return;

    try {
      this.audioContext ??= new AudioContext();

      await Promise.race([
        this.audioContext.resume(),
        new Promise<void>((resolve) => setTimeout(resolve, UNLOCK_TIMEOUT_MS)),
      ]);

      if (this.audioContext.state === 'running') {
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        this.unlocked = true;
      }
    } catch {
      // AudioContext unavailable; playback silently degrades to no sound.
    }
  }

  /**
   * Generate a short beep using Web Audio API.
   * Used for timer ticks and countdown beeps.
   */
  playBeep(): void {
    if (!this.audioContext) {
      console.warn('AudioService: AudioContext not initialized');
      return;
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(this.volume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  play(id: SoundId): void {
    const sound = this.sounds.get(id);
    if (!sound) return;

    sound.volume = this.volume;
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Audio playback failed
    });
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }
}

export const audioService = new AudioService();
