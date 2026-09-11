import { describe, it, expect } from 'vitest';
import {
  EXERCISE_TEMPLATES,
  MUSCLE_GROUP_ORDER,
  DIFFICULTY_ORDER,
} from './templates';

describe('EXERCISE_TEMPLATES', () => {
  it('has a comprehensive catalog', () => {
    expect(EXERCISE_TEMPLATES.length).toBeGreaterThanOrEqual(120);
  });

  it('has unique ids', () => {
    const ids = EXERCISE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique names', () => {
    const names = EXERCISE_TEMPLATES.map((t) => t.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('always declares at least one muscle group', () => {
    for (const t of EXERCISE_TEMPLATES) {
      expect(t.muscleGroups.length, `${t.id} has no muscle groups`).toBeGreaterThanOrEqual(1);
    }
  });

  it('always declares at least one equipment entry', () => {
    for (const t of EXERCISE_TEMPLATES) {
      expect(t.equipment.length, `${t.id} has no equipment`).toBeGreaterThanOrEqual(1);
    }
  });

  it('uses known muscle groups and difficulties', () => {
    for (const t of EXERCISE_TEMPLATES) {
      for (const g of t.muscleGroups) {
        expect(MUSCLE_GROUP_ORDER, `${t.id} unknown muscle group ${g}`).toContain(g);
      }
      expect(DIFFICULTY_ORDER, `${t.id} unknown difficulty`).toContain(t.difficulty);
    }
  });

  it('times hiit and yoga exercises, reps strength exercises', () => {
    for (const t of EXERCISE_TEMPLATES) {
      if (t.type === 'hiit' || t.type === 'yoga') {
        expect(t.duration, `${t.id} should be timed`).toBeGreaterThan(0);
        expect(t.reps, `${t.id} should not have reps`).toBeNull();
      } else {
        const timed = t.duration !== null && t.duration > 0;
        const counted = t.reps !== null && t.reps > 0;
        expect(timed !== counted, `${t.id} must be timed or counted, not both/neither`).toBe(true);
      }
    }
  });

  it('has a form-cue note on every exercise', () => {
    for (const t of EXERCISE_TEMPLATES) {
      expect(t.notes.trim().length, `${t.id} has no notes`).toBeGreaterThan(0);
    }
  });
});
