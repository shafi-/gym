

/**
 * VoiceService — Pure Web Speech API wrapper.
 *
 * Responsibility: Handle speech synthesis, queueing, and voice management.
 * Does NOT decide WHAT to announce or WHEN — that's AnnounceTracker's job.
 */

export type AnnouncementPriority = 'high' | 'normal' | 'low';

interface Announcement {
  text: string;
  priority: AnnouncementPriority;
}

export class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private queue: Announcement[] = [];
  private speaking: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private enabled: boolean = true;
  private voicesLoaded: boolean = false;
  private voiceLoadPromise: Promise<void> | null = null;
  private onAnnounceCallback: ((text: string) => void) | null = null;
  private lastSpeakTime: number = 0;
  private minSpeakInterval: number = 100;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.voiceLoadPromise = this.createVoiceLoadPromise();
    }
  }

  private createVoiceLoadPromise(): Promise<void> {
    return new Promise((resolve) => {
      const voices = this.synth?.getVoices() || [];
      if (voices.length > 0) {
        this.voicesLoaded = true;
        resolve();
        return;
      }
      this.synth!.onvoiceschanged = () => {
        this.voicesLoaded = true;
        resolve();
      };
      setTimeout(() => {
        if (!this.voicesLoaded) {
          this.voicesLoaded = true;
          resolve();
        }
      }, 2000);
    });
  }

  public async ensureReady(): Promise<void> {
    if (this.voicesLoaded) return;
    await this.voiceLoadPromise;
  }

  private findWorkingVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;
    if (this.voice) {
            const found = voices.find(v => v.voiceURI === this.voice?.voiceURI);
      if (found) return found;
    }
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    return englishVoice || voices[0];
  }

  public isSupported(): boolean { return this.synth !== null; }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  public isEnabled(): boolean { return this.enabled; }

  public async speak(text: string, priority: AnnouncementPriority = 'normal'): Promise<void> {
    if (!this.enabled || !this.isSupported() || !text.trim()) return;
    await this.ensureReady();

    const now = Date.now();
    if (now - this.lastSpeakTime < this.minSpeakInterval && priority !== 'high') return;
    this.lastSpeakTime = now;

    const announcement: Announcement = { text, priority };

    if (priority === 'high') {
      this.queue = [];
      this.speaking = false;
      this.speakNext(announcement);
      return;
    }

    this.queue.push(announcement);
    if (!this.speaking) this.processQueue();
  }

  private processQueue(): void {
    if (this.queue.length === 0) {
      this.speaking = false;
      return;
    }
    this.speaking = true;
    const announcement = this.queue.shift()!;
    this.speakNext(announcement);
  }

  private speakNext(announcement: Announcement): void {
    if (!this.synth) {
      console.warn('[Voice] SpeechSynthesis not available');
      return;
    }

    this.onAnnounceCallback?.(announcement.text);

    const utterance = new SpeechSynthesisUtterance(announcement.text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    const workingVoice = this.findWorkingVoice();
    if (workingVoice) {
      utterance.voice = workingVoice;
      utterance.lang = workingVoice.lang || 'en-US';
    }

    utterance.onend = () => {
      console.log('[Voice] Finished:', announcement.text);
      this.processQueue();
    };
    utterance.onerror = (e) => {
      console.error('[Voice] Error:', e.error, announcement.text);
      this.processQueue();
    };

    console.log('[Voice] Speaking:', announcement.text, 'voice:', workingVoice?.name || 'default');
    this.synth.speak(utterance);
  }

  public stop(): void {
    this.synth?.cancel();
    this.queue = [];
    this.speaking = false;
  }

  public pause(): void { this.synth?.pause(); }
  public resume(): void { this.synth?.resume(); }
  public isSpeaking(): boolean { return this.speaking; }

  public prime(): void {
    if (!this.synth) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    this.synth.speak(u);
    console.log('[Voice] Primed');
  }

  public setOnAnnounceCallback(callback: (text: string) => void): void {
    this.onAnnounceCallback = callback;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setVoice(voiceURI: string): void {
    const voices = this.getVoices();
    this.voice = voices.find(v => v.voiceURI === voiceURI) || null;
  }

  public setRate(rate: number): void { this.rate = Math.max(0.5, Math.min(2.0, rate)); }
  public setPitch(pitch: number): void { this.pitch = Math.max(0, Math.min(2, pitch)); }
  public getRate(): number { return this.rate; }
  public getPitch(): number { return this.pitch; }

  public reset(): void {
    this.queue = [];
    this.speaking = false;
    this.stop();
  }
}

export const voiceService = new VoiceService();
