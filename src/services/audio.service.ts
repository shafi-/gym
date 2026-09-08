type SoundId = 'stage-start' | 'stage-end' | 'rest-start' | 'rest-end' | 'session-complete' | 'countdown-beep';

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
      'stage-start': '/audio/stage-start.mp3',
      'stage-end': '/audio/stage-end.mp3',
      'rest-start': '/audio/rest-start.mp3',
      'rest-end': '/audio/rest-end.mp3',
      'session-complete': '/audio/session-complete.mp3',
      'countdown-beep': '/audio/beep.mp3',
    };

    for (const [id, path] of Object.entries(soundFiles)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.load();
      this.sounds.set(id as SoundId, audio);
    }
  }

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    // Create AudioContext on user gesture
    this.audioContext = new AudioContext();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Play silent buffer to fully unlock playback
    const buffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);

    this.unlocked = true;
  }

  play(id: SoundId): void {
    const sound = this.sounds.get(id);
    if (!sound) return;

    sound.volume = this.volume;
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Audio playback failed (e.g., not yet unlocked)
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

// Singleton instance
export const audioService = new AudioService();
