# Voice Guidance System — Architecture & Plan

## Overview

Transform Pulse into a **hands-free workout coach** that guides users entirely through audio. Users create plans with sets and intervals, then the app speaks stage names, announces start/stop, counts down transitions, and provides rest period guidance — all without needing to look at the screen.

## Design Principles

1. **Non-blocking** — Voice never delays the timer or session flow
2. **Configurable** — Every announcement type can be toggled in settings
3. **Offline-first** — Uses Web Speech API (no network required)
4. **Non-repeating** — Announcements fire once per event, even with rapid re-renders
5. **Priority-aware** — Critical announcements (start/stop) can interrupt lower-priority ones

---

## Architecture

### Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                      SessionContainer                        │
│  (orchestrates session, subscribes to progress changes)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       VoiceService                           │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ SpeechQueue   │  │ Announcement   │  │ Settings      │  │
│  │ (manages TTS  │  │ Builder        │  │ (reads from   │  │
│  │  utterance    │  │ (constructs    │  │  settings     │  │
│  │  ordering)    │  │  text to speak)│  │  store)       │  │
│  └───────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Web Speech API                          │
│              (SpeechSynthesis / SpeechSynthesisUtterance)    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Session Progress Change
        │
        ▼
VoiceService.announce(progress)
        │
        ├── State changed? → Build announcement text
        │     ├── stage-active → "{Stage name}. Go!"
        │     ├── rest-period → "Rest for {N} seconds"
        │     └── completed   → "Workout complete!"
        │
        ├── Timer threshold? → Build countdown/warning
        │     ├── pre-stage warning → "Next: {name} in 5 seconds"
        │     └── countdown → "3... 2... 1..."
        │
        └── Queue announcement → SpeechSynthesis.speak()
```

---

## VoiceService Design

### Class Interface

```typescript
type AnnouncementPriority = 'high' | 'normal' | 'low';

interface Announcement {
  text: string;
  priority: AnnouncementPriority;
  interruptible: boolean;
}

export class VoiceService {
  private synth: SpeechSynthesis;
  private queue: Announcement[] = [];
  private speaking: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;

  constructor();

  // Core methods
  speak(text: string, priority?: AnnouncementPriority): void;
  stop(): void;
  pause(): void;
  resume(): void;

  // Session-aware announcement
  announce(progress: SessionProgress, previousState?: SessionState): void;

  // Configuration
  setVoice(voiceURI: string): void;
  setRate(rate: number): void;
  setPitch(pitch: number): void;
  getVoices(): SpeechSynthesisVoice[];

  // State
  isSpeaking(): boolean;
  isSupported(): boolean;
}
```

### Announcement Types

| Trigger | Announcement | Priority | Example |
|---------|--------------|----------|---------|
| Stage starts | `"{Name}. Go!"` | High | "Squats. Go!" |
| Stage ends (rest) | `"Rest for {N} seconds"` | Normal | "Rest for 30 seconds" |
| Pre-stage warning | `"Next: {Name} in {N} seconds"` | Normal | "Next: Push-ups in 5 seconds" |
| Countdown (last 3s) | `"3... 2... 1..."` | Low | "3... 2... 1..." |
| Session complete | `"Workout complete!"` | High | "Workout complete!" |
| Pause | `"Paused"` | High | "Paused" |
| Resume | `"Resumed. Go!"` | High | "Resumed. Go!" |

### Queue Management

```typescript
// Priority handling
// - High priority: Interrupts current speech, clears queue
// - Normal priority: Added to queue, spoken in order
// - Low priority: Added to queue, skipped if higher priority added

// Example flow:
// 1. "Rest for 30 seconds" (normal) → speaking
// 2. "Next: Push-ups in 5 seconds" (normal) → queued
// 3. "Push-ups. Go!" (high) → interrupts, clears queue, speaks immediately
```

---

## Settings Extension

### Updated Settings Store

```typescript
interface SettingsStore {
  // Existing
  volume: number;
  soundEnabled: boolean;
  voiceCountdownEnabled: boolean;

  // New voice guidance settings
  voiceEnabled: boolean;           // Master toggle for all voice
  voiceVolume: number;             // Voice volume (0-1)
  voiceRate: number;               // Speech rate (0.5-2)
  voicePitch: number;              // Speech pitch (0-2)

  // Announcement toggles
  announceStageName: boolean;      // Speak stage names
  announceStartStop: boolean;      // "Go!" / "Stop!"
  announceRest: boolean;           // Rest period announcements
  announceCountdown: boolean;      // Voice countdown (3, 2, 1)

  // Timing
  preStageWarningSeconds: number;  // 0 = off, 3/5/10 = warning before stage

  // Voice selection
  selectedVoiceURI: string;        // Selected voice URI

  // Setters
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceVolume: (volume: number) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setAnnounceStageName: (enabled: boolean) => void;
  setAnnounceStartStop: (enabled: boolean) => void;
  setAnnounceRest: (enabled: boolean) => void;
  setAnnounceCountdown: (enabled: boolean) => void;
  setPreStageWarningSeconds: (seconds: number) => void;
  setSelectedVoiceURI: (uri: string) => void;
}
```

### Settings UI Additions

New section in Settings page:

```
┌─────────────────────────────────────────┐
│  🎙️ Voice Guidance                      │
├─────────────────────────────────────────┤
│  Voice Announcements        [Toggle]    │
│                                         │
│  Voice: [Dropdown ▼]                    │
│  Rate:  [────●────] 1.0x               │
│  Volume: [────●────] 80%               │
│                                         │
│  ── Announcements ──────────────────    │
│  Stage names               [Toggle]    │
│  Start/Stop cues           [Toggle]    │
│  Rest periods              [Toggle]    │
│  Countdown (3-2-1)         [Toggle]    │
│                                         │
│  ── Timing ─────────────────────────    │
│  Pre-stage warning: [5s ▼]             │
│    (Off / 3s / 5s / 10s)               │
└─────────────────────────────────────────┘
```

---

## Integration Points

### 1. SessionContainer

```typescript
// In SessionContainer.tsx
const voiceService = useRef(new VoiceService()).current;
const previousStateRef = useRef<SessionState>('idle');

useEffect(() => {
  session.onTick((progress) => {
    setProgress(progress);

    // Voice announcements
    if (settings.voiceEnabled) {
      voiceService.announce(progress, previousStateRef.current);
      previousStateRef.current = progress.state;
    }

    // Existing audio cues
    // ...
  });
}, []);
```

### 2. SessionService (minimal changes)

No changes needed to SessionService itself. VoiceService subscribes to the same progress callbacks.

### 3. App Initialization

```typescript
// In main.tsx or App.tsx
// Pre-load voices
const voiceService = new VoiceService();
voiceService.getVoices(); // Triggers voice loading
```

---

## Implementation Plan

### Phase 1: Core Voice Service
- [ ] Create `VoiceService` class with Web Speech API
- [ ] Implement priority queue system
- [ ] Add `announce()` method for session progress
- [ ] Handle browser compatibility (feature detection)

### Phase 2: Settings Integration
- [ ] Extend settings store with voice options
- [ ] Add Voice section to Settings page
- [ ] Voice selection dropdown
- [ ] Rate/volume sliders
- [ ] Announcement type toggles

### Phase 3: Session Integration
- [ ] Integrate VoiceService into SessionContainer
- [ ] Track previous state for change detection
- [ ] Wire up all announcement triggers
- [ ] Handle pause/resume announcements

### Phase 4: Polish & Edge Cases
- [ ] Pre-stage warnings during rest
- [ ] Voice countdown (3, 2, 1)
- [ ] iOS Safari quirks handling
- [ ] Voice loading on app start
- [ ] Graceful fallback if TTS unavailable

---

## Browser Compatibility

| Browser | SpeechSynthesis | Notes |
|---------|-----------------|-------|
| Chrome | ✅ Full | Best support |
| Firefox | ✅ Full | Good support |
| Safari | ✅ Full | Requires user gesture to start |
| iOS Safari | ⚠️ Partial | No volume control, no rate change in some versions |
| Chrome Android | ✅ Full | Good support |

### iOS Workarounds
- Speech must be triggered by user gesture (tap "Start Session" counts)
- Volume controlled by system (hide volume slider, show note)
- Rate changes may be ignored (show note)

---

## File Structure

```
src/
├── services/
│   ├── audio.service.ts      (existing sound effects)
│   └── voice.service.ts      (NEW: TTS announcements)
├── hooks/
│   ├── useAudio.ts           (existing)
│   └── useVoice.ts           (NEW: voice hook)
├── stores/
│   └── settings.store.ts     (extended with voice settings)
├── components/
│   └── settings/
│       └── VoiceSettings.tsx (NEW: voice settings UI)
└── containers/
    └── session/
        └── SessionContainer.tsx (updated: integrate voice)
```

---

## Testing Strategy

| Test | Description |
|------|-------------|
| Unit | VoiceService queue logic, priority handling |
| Unit | Announcement text construction |
| Integration | Voice fires on session state changes |
| Integration | Settings changes affect voice behavior |
| E2E | Full session with voice enabled |
| E2E | Toggle voice mid-session |
| Manual | iOS Safari behavior |
| Manual | Rapid state changes (no duplicate announcements) |

---

## Future Enhancements (Deferred)

- [ ] Headphone/bluetooth media button controls
- [ ] Custom announcement templates
- [ ] Pre-recorded professional voice packs
- [ ] Rep counting with voice ("5... 4... 3...")
- [ ] Motivational quotes between sets
- [ ] Heart rate integration announcements
