import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the service singletons before importing AnnounceTracker.
vi.mock('./voice.service', () => ({
  voiceService: { speak: vi.fn(), stop: vi.fn(), reset: vi.fn() },
}));
vi.mock('./audio.service', () => ({
  audioService: { playBeep: vi.fn(), play: vi.fn() },
}));

import { AnnounceTracker } from './announce-tracker.service';
import { voiceService } from './voice.service';
import { audioService } from './audio.service';
import type { SessionProgress, SessionState } from './session.service';

const speak = voiceService.speak as unknown as ReturnType<typeof vi.fn>;
const playBeep = audioService.playBeep as unknown as ReturnType<typeof vi.fn>;

function progress(overrides: Partial<SessionProgress>): SessionProgress {
  return {
    state: 'stage-active',
    currentStageIndex: 0,
    totalStages: 2,
    currentStage: { id: 's0', planId: 'p', order: 0, name: 'Jumping Jacks', mediaType: null, mediaId: null, duration: 10, reps: null, notes: '', restAfter: null },
    nextStage: { id: 's1', planId: 'p', order: 1, name: 'High Knees', mediaType: null, mediaId: null, duration: 10, reps: null, notes: '', restAfter: null },
    timeRemaining: 10,
    totalStageTime: 10,
    isPaused: false,
    ...overrides,
  };
}

function newTracker(): AnnounceTracker {
  return new AnnounceTracker({
    announceStageName: true,
    announceStartStop: true,
    announceRest: true,
    announceCountdown: true,
    preStageWarningSeconds: 5,
  });
}

function spokenTexts(): string[] {
  return speak.mock.calls.map((c) => c[0] as string);
}

beforeEach(() => {
  vi.useFakeTimers();
  speak.mockClear();
  playBeep.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AnnounceTracker — stage announcements', () => {
  it('announces stage name with .Go! (high priority) at stage start', () => {
    const t = newTracker();
    t.announce(progress({ state: 'stage-active', timeRemaining: 10 }));
    expect(spokenTexts()).toEqual(['Jumping Jacks. Go!']);
    expect(speak).toHaveBeenCalledWith('Jumping Jacks. Go!', 'high');
  });

  it('does not re-announce the stage on subsequent ticks of the same stage', () => {
    const t = newTracker();
    t.announce(progress({ state: 'stage-active', timeRemaining: 10 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 9 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 8 }));
    expect(speak.mock.calls.filter(([t]) => String(t).includes('Go!')).length).toBe(1);
  });

  it('announces rest duration (normal priority) when rest begins', () => {
    const t = newTracker();
    t.announce(progress({ state: 'stage-active', timeRemaining: 5 }));
    t.announce(progress({ state: 'rest-period', timeRemaining: 10, totalStageTime: 10 }));
    expect(spokenTexts()).toContain('Take rest 10 seconds');
    expect(speak).toHaveBeenCalledWith('Take rest 10 seconds', 'normal');
  });
});

describe('AnnounceTracker — pre-stage warning', () => {
  it('announces the NEXT stage during rest (not the finished one)', () => {
    const t = newTracker();
    // First tick = rest begins (state change) → "Take rest".
    t.announce(progress({ state: 'rest-period', timeRemaining: 8, currentStageIndex: 0 }));
    // Subsequent tick, same state: 8 = warningSeconds(5) + speech(3).
    t.announce(progress({ state: 'rest-period', timeRemaining: 8, currentStageIndex: 0 }));
    expect(spokenTexts()).toContain('High Knees in 5 seconds');
    expect(spokenTexts()).not.toContain('Jumping Jacks in 5 seconds');
  });

  it('pre-stage warning fires only once per rest period', () => {
    const t = newTracker();
    t.announce(progress({ state: 'rest-period', timeRemaining: 8 })); // state change
    t.announce(progress({ state: 'rest-period', timeRemaining: 8 })); // warning
    t.announce(progress({ state: 'rest-period', timeRemaining: 7 }));
    t.announce(progress({ state: 'rest-period', timeRemaining: 6 }));
    const warnings = spokenTexts().filter((s) => s.includes('seconds'));
    expect(warnings.filter((s) => s === 'High Knees in 5 seconds')).toHaveLength(1);
  });
});

describe('AnnounceTracker — countdown', () => {
  it('speaks 3, 2, 1 exactly once each', () => {
    const t = newTracker();
    t.announce(progress({ state: 'stage-active', timeRemaining: 5 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 3 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 3 })); // duplicate tick
    t.announce(progress({ state: 'stage-active', timeRemaining: 2 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 1 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 1 })); // duplicate tick

    const count = (n: number) =>
      spokenTexts().filter((s) => s === String(n)).length;
    expect(count(3)).toBe(1);
    expect(count(2)).toBe(1);
    expect(count(1)).toBe(1);
  });

  it('does not count down while paused', () => {
    const t = newTracker();
    t.announce(progress({ state: 'stage-active', timeRemaining: 5 }));
    t.announce(progress({ state: 'stage-active', timeRemaining: 2, isPaused: true }));
    const twos = spokenTexts().filter((s) => s === '2').length;
    expect(twos).toBe(0);
  });
});

describe('AnnounceTracker — completion', () => {
  it('speaks completion via speakCompletion()', () => {
    const t = newTracker();
    t.speakCompletion();
    expect(speak).toHaveBeenCalledWith('Congratulations, you did it!', 'high');
  });

  it('does NOT speak completion via a completed-state tick (single source of truth)', () => {
    const t = newTracker();
    t.announce(progress({ state: 'computed' as SessionState, currentStageIndex: 0 }));
    expect(spokenTexts()).not.toContain('Congratulations, you did it!');
  });
});