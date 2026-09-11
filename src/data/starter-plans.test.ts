import { describe, it, expect } from 'vitest';
import { createStarterPlans } from './starter-plans';

describe('starter plans', () => {
  const plans = createStarterPlans(0);

  it('bundles five plans across workout types', () => {
    expect(plans.length).toBe(5);
    expect(new Set(plans.map((p) => p.type))).toEqual(new Set(['hiit', 'strength', 'yoga']));
  });

  it('has unique plan and stage ids', () => {
    const planIds = plans.map((p) => p.id);
    const stageIds = plans.flatMap((p) => p.stages.map((s) => s.id));
    expect(new Set(planIds).size).toBe(planIds.length);
    expect(new Set(stageIds).size).toBe(stageIds.length);
  });

  it('marks every plan as a starter plan', () => {
    for (const plan of plans) {
      expect(plan.isStarter).toBe(true);
    }
  });

  it('times every stage so the session player works end-to-end', () => {
    for (const plan of plans) {
      for (const stage of plan.stages) {
        expect(stage.duration, `${plan.id}/${stage.id} is untimed`).toBeGreaterThan(0);
        expect(stage.reps).toBeNull();
        expect(stage.mediaId).toBeNull();
        expect(stage.mediaType).toBeNull();
      }
    }
  });

  it('orders stages sequentially and links them to the plan', () => {
    for (const plan of plans) {
      expect(plan.stages.length).toBeGreaterThanOrEqual(4);
      plan.stages.forEach((stage, index) => {
        expect(stage.order).toBe(index);
        expect(stage.planId).toBe(plan.id);
      });
    }
  });

  it('keeps plans roughly between 5 and 20 minutes', () => {
    for (const plan of plans) {
      const work = plan.stages.reduce((sum, s) => sum + (s.duration ?? 0), 0);
      const rests = plan.stages.slice(0, -1).reduce(
        (sum, s) => sum + (s.restAfter ?? plan.restBetweenStages),
        0
      );
      const total = work + rests;
      expect(total, `${plan.id} is ${total}s`).toBeGreaterThanOrEqual(5 * 60);
      expect(total, `${plan.id} is ${total}s`).toBeLessThanOrEqual(20 * 60);
    }
  });
});
