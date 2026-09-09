import type { SessionProgress, SessionState } from './session.service';

type AnnouncementPriority = 'high' | 'normal' | 'low';

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

  // Track what's been announced to avoid duplicates
  private lastAnnouncedState: SessionState | null = null;
  private lastAnnouncedStageIndex: number = -1;
  private warnedThresholds: Set<number> = new Set();
  private countdownSpoken: Set<number> = new Set();
  private onAnnounceCallback: ((text: string) => void) | null = null;
  private lastSpeakTime: number = 0;
  private minSpeakInterval: number = 100; // Minimum ms between speak calls

  private voicesLoaded: boolean = false;
  private voiceLoadPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;

      // Create a promise that resolves when voices are loaded
      this.voiceLoadPromise = new Promise((resolve) => {
        const voices = this.synth?.getVoices() || [];
        if (voices.length > 0) {
          this.voicesLoaded = true;
          resolve();
          return;
        }

        // Wait for voices to load
        this.synth!.onvoiceschanged = () => {
          this.voicesLoaded = true;
          console.log('[Voice] Voices loaded:', this.synth?.getVoices().length);
          resolve();
        };

        // Timeout fallback
        setTimeout(() => {
          if (!this.voicesLoaded) {
            this.voicesLoaded = true;
            console.warn('[Voice] Voice load timeout, proceeding anyway');
            resolve();
          }
        }, 2000);
      });

      // Log initial voice count
      console.log('[Voice] Initial voices:', this.synth.getVoices().length);
    } else {
      console.warn('[Voice] SpeechSynthesis not supported');
    }
  }

  /**
   * Wait for voices to be loaded before speaking
   */
  async ensureReady(): Promise<void> {
    if (this.voicesLoaded) return;
    await this.voiceLoadPromise;
  }

  /**
   * Find a working voice for the current browser
   */
  private findWorkingVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;

    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    // If a voice is selected and available, use it
    if (this.voice) {
      const found = voices.find(v => v.voiceURI === this.voice!.voiceURI);
      if (found) return found;
    }

    // Try to find an English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) return englishVoice;

    // Fall back to first available voice
    return voices[0];
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async speak(text: string, priority: AnnouncementPriority = 'normal'): Promise<void> {
    if (!this.enabled || !this.isSupported() || !text.trim()) return;

    // Wait for voices to be loaded
    await this.ensureReady();

    // Debounce rapid successive calls
    const now = Date.now();
    if (now - this.lastSpeakTime < this.minSpeakInterval && priority !== 'high') {
      return;
    }
    this.lastSpeakTime = now;

    const announcement: Announcement = { text, priority };

    if (priority === 'high') {
      // For high priority, just speak immediately - browser will interrupt
      this.queue = [];
      this.speaking = false;
      this.speakNext(announcement);
      return;
    }

    this.queue.push(announcement);
    if (!this.speaking) {
      this.processQueue();
    }
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

    // Notify callback for debugging
    this.onAnnounceCallback?.(announcement.text);

    const utterance = new SpeechSynthesisUtterance(announcement.text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    // Find a working voice for this browser
    const workingVoice = this.findWorkingVoice();
    if (workingVoice) {
      utterance.voice = workingVoice;
      utterance.lang = workingVoice.lang || 'en-US';
    }

    utterance.onstart = () => {
      console.log('[Voice] Started speaking:', announcement.text);
    };

    utterance.onend = () => {
      console.log('[Voice] Finished speaking:', announcement.text);
      this.processQueue();
    };

    utterance.onerror = (event) => {
      console.error('[Voice] Error:', event.error, 'at', event.charIndex, announcement.text);
      this.processQueue();
    };

    console.log('[Voice] Calling synth.speak for:', announcement.text);
    console.log('[Voice] Utterance voice:', utterance.voice?.name || 'default');
    console.log('[Voice] Utterance lang:', utterance.lang);
    console.log('[Voice] Synth pending:', this.synth.pending);
    console.log('[Voice] Synth speaking:', this.synth.speaking);
    console.log('[Voice] Synth paused:', this.synth.paused);
    console.log('[Voice] Available voices:', this.synth.getVoices().length);
    console.log('[Voice] Selected voice:', workingVoice?.name || 'default');

    // Some browsers need a small delay before speaking
    requestAnimationFrame(() => {
      this.synth!.speak(utterance);
    });
  }

  stop(): void {
    this.synth?.cancel();
    this.queue = [];
    this.speaking = false;
  }

  pause(): void {
    this.synth?.pause();
  }

  resume(): void {
    this.synth?.resume();
  }

  isSpeaking(): boolean {
    return this.speaking;
  }

  /**
   * Prime the speech engine - must be called on user gesture
   * Some browsers (iOS Safari) require a user gesture to enable speech
   */
  prime(): void {
    if (!this.synth) return;
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    this.synth.speak(utterance);
    console.log('[Voice] Primed');
  }

  setOnAnnounceCallback(callback: (text: string) => void): void {
    this.onAnnounceCallback = callback;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  setVoice(voiceURI: string): void {
    const voices = this.getVoices();
    this.voice = voices.find(v => v.voiceURI === voiceURI) || null;
  }

  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  setPitch(pitch: number): void {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  getRate(): number {
    return this.rate;
  }

  getPitch(): number {
    return this.pitch;
  }

  async announce(
    progress: SessionProgress,
    options: {
      announceStageName?: boolean;
      announceStartStop?: boolean;
      announceRest?: boolean;
      announceCountdown?: boolean;
      preStageWarningSeconds?: number;
    } = {}
  ): Promise<void> {
    if (!this.enabled || !this.isSupported()) return;

    await this.ensureReady();

    const {
      announceStageName = true,
      announceStartStop = true,
      announceRest = true,
      announceCountdown = true,
      preStageWarningSeconds = 5,
    } = options;

    const { state, currentStageIndex, timeRemaining } = progress;

    if (state !== this.lastAnnouncedState || currentStageIndex !== this.lastAnnouncedStageIndex) {
      this.handleStateChange(progress, announceStageName, announceStartStop, announceRest);
      this.lastAnnouncedState = state;
      this.lastAnnouncedStageIndex = currentStageIndex;
      this.warnedThresholds.clear();
      this.countdownSpoken.clear();
      return;
    }

    if (!progress.isPaused) {
      if (state === 'rest-period' && preStageWarningSeconds > 0) {
        this.handlePreStageWarning(progress, preStageWarningSeconds);
      }

      if (state === 'stage-active' && announceCountdown) {
        this.handleCountdown(timeRemaining);
      }
    }
  }

  private handleStateChange(
    progress: SessionProgress,
    announceStageName: boolean,
    announceStartStop: boolean,
    announceRest: boolean
  ): void {
    const { state, currentStage, timeRemaining } = progress;

    switch (state) {
      case 'stage-active':
        if (currentStage && announceStageName) {
          const stageName = currentStage.name;
          if (announceStartStop) {
            this.speak(`${stageName}. Go!`, 'high');
          } else {
            this.speak(stageName, 'high');
          }
        }
        break;

      case 'rest-period':
        if (announceRest) {
          this.speak(`Rest for ${timeRemaining} seconds`, 'normal');
        }
        break;

      case 'completed':
        this.speak('Workout complete!', 'high');
        break;
    }
  }

  private handlePreStageWarning(progress: SessionProgress, warningSeconds: number): void {
    const { timeRemaining, currentStageIndex } = progress;

    if (timeRemaining <= warningSeconds && timeRemaining > 0) {
      const thresholdKey = currentStageIndex * 1000 + warningSeconds;
      if (!this.warnedThresholds.has(thresholdKey)) {
        this.warnedThresholds.add(thresholdKey);
        this.speak(`Next stage in ${timeRemaining} seconds`, 'normal');
      }
    }
  }

  private handleCountdown(timeRemaining: number): void {
    if (timeRemaining <= 3 && timeRemaining > 0) {
      if (!this.countdownSpoken.has(timeRemaining)) {
        this.countdownSpoken.add(timeRemaining);
        this.speak(String(timeRemaining), 'low');
      }
    }
  }

  reset(): void {
    this.lastAnnouncedState = null;
    this.lastAnnouncedStageIndex = -1;
    this.warnedThresholds.clear();
    this.countdownSpoken.clear();
    this.stop();
  }
}

export const voiceService = new VoiceService();
