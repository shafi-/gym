import type { Plan, Stage, WorkoutType } from '../models/plan.model';

type StageSpec = [name: string, duration: number, notes: string, restAfter?: number];

function buildStage(planId: string, order: number, [name, duration, notes, restAfter]: StageSpec): Stage {
  return {
    id: `${planId}-s${order + 1}`,
    planId,
    order,
    name,
    mediaType: null,
    mediaId: null,
    duration,
    reps: null,
    notes,
    restAfter: restAfter ?? null,
  };
}

function buildPlan(
  id: string,
  name: string,
  type: WorkoutType,
  restBetweenStages: number,
  stageSpecs: StageSpec[],
  now: number
): Plan {
  return {
    id,
    name,
    type,
    stages: stageSpecs.map((spec, order) => buildStage(id, order, spec)),
    restBetweenStages,
    createdAt: now,
    updatedAt: now,
    isStarter: true,
  };
}

/**
 * Ready-made plans bundled with the app and seeded into the database on first
 * launch so new users can press play immediately. Every stage is timed (reps
 * live in the notes) so the session player works end-to-end out of the box.
 */
export function createStarterPlans(now: number = Date.now()): Plan[] {
  return [
    buildPlan(
      'starter-quick-hiit',
      'Starter: Quick HIIT',
      'hiit',
      30,
      [
        ['Jumping Jacks', 45, 'Keep a steady pace, land softly.'],
        ['High Knees', 30, 'Drive knees up to hip height.'],
        ['Squat Jumps', 30, 'Land soft, sink into the next rep.'],
        ['Burpees', 30, 'Full extension at the top.'],
        ['Mountain Climbers', 45, 'Keep hips level, quick feet.'],
        ['Skaters', 30, 'Leap side to side, stick the landing.'],
        ['Plank Jacks', 30, 'Keep core tight, jump feet wide.'],
        ['Sprint in Place', 30, 'Maximum effort.'],
        ['Star Jumps', 30, 'Explode wide, snap back tight.'],
        ['Plank Hold', 45, 'Squeeze glutes, don\'t sag the hips.'],
      ],
      now
    ),
    buildPlan(
      'starter-fullbody-strength',
      'Starter: Full-Body Strength',
      'strength',
      45,
      [
        ['Bodyweight Squats', 60, '3×12 — hips below knees, chest up.'],
        ['Push-ups', 60, '3×10–15 — chest to floor, full lockout.'],
        ['Reverse Lunges', 60, '3×10 per leg — torso upright.'],
        ['Glute Bridge', 60, '3×15 — squeeze glutes hard at the top.'],
        ['Plank Hold', 45, 'Squeeze glutes, don\'t sag the hips.'],
        ['Supermans', 45, '3×12 — lift arms and legs, gaze down.'],
        ['Wall Sit', 45, 'Thighs parallel to floor.'],
        ['Tricep Dips', 60, '3×10 — use a chair or low surface.'],
        ['Calf Raises', 60, '3×20 — pause at the top.'],
        ['Side Plank (Right)', 30, 'Stack the feet, hips high.'],
        ['Side Plank (Left)', 30, 'Stack the feet, hips high.'],
      ],
      now
    ),
    buildPlan(
      'starter-core-crusher',
      'Starter: Core Crusher',
      'hiit',
      20,
      [
        ['Bicycle Crunches', 40, 'Elbow toward the opposite knee, slow and controlled.'],
        ['Flutter Kicks', 40, 'Lower back pressed down, small quick kicks.'],
        ['Russian Twists', 40, 'Chest up, rotate side to side.'],
        ['Plank Shoulder Taps', 40, 'Feet wide, resist the hip sway.'],
        ['Dead Bug', 40, 'Extend opposite arm and leg slowly.'],
        ['V-Ups', 30, 'Touch the toes, control the way down.'],
        ['Heel Taps', 40, 'Knees up, tap each heel to the floor.'],
        ['Plank Hold', 60, 'Squeeze glutes, don\'t sag the hips.'],
      ],
      now
    ),
    buildPlan(
      'starter-morning-yoga',
      'Starter: Morning Yoga Flow',
      'yoga',
      10,
      [
        ['Cat-Cow', 60, 'Move slowly with the breath.'],
        ['Downward Dog', 60, 'Hips high, heels reaching down.'],
        ['Low Lunge (Right)', 45, 'Back knee down, hips press forward.'],
        ['Low Lunge (Left)', 45, 'Back knee down, hips press forward.'],
        ['Warrior I (Right)', 45, 'Front knee at 90°, back foot flat.'],
        ['Warrior I (Left)', 45, 'Front knee at 90°, back foot flat.'],
        ['Warrior II (Right)', 45, 'Arms extended, gaze over front hand.'],
        ['Warrior II (Left)', 45, 'Arms extended, gaze over front hand.'],
        ['Standing Forward Fold', 45, 'Soft knees, let the head hang heavy.'],
        ['Cobra Pose', 30, 'Lift chest, shoulders back and down.'],
        ['Child\'s Pose', 60, 'Knees wide, arms extended forward.'],
        ['Seated Forward Fold', 60, 'Hinge at hips, reach for toes.'],
      ],
      now
    ),
    buildPlan(
      'starter-tabata',
      'Starter: Tabata Burner',
      'hiit',
      10,
      [
        ['Squat Jumps', 20, 'Work 20s, rest 10s.'],
        ['Mountain Climbers', 20, 'Work 20s, rest 10s.'],
        ['Skaters', 20, 'Work 20s, rest 10s.'],
        ['Plank Jacks', 20, 'Work 20s, rest 10s.'],
        ['Squat Jumps', 20, 'Work 20s, rest 10s.'],
        ['Mountain Climbers', 20, 'Work 20s, rest 10s.'],
        ['Skaters', 20, 'Work 20s, rest 10s.'],
        ['Plank Jacks', 20, 'End of block — extra 30s rest next.', 30],
        ['High Knees', 20, 'Work 20s, rest 10s.'],
        ['Burpees', 20, 'Work 20s, rest 10s.'],
        ['Star Jumps', 20, 'Work 20s, rest 10s.'],
        ['Sprint in Place', 20, 'Work 20s, rest 10s.'],
        ['High Knees', 20, 'Work 20s, rest 10s.'],
        ['Burpees', 20, 'Work 20s, rest 10s.'],
        ['Star Jumps', 20, 'Work 20s, rest 10s.'],
        ['Sprint in Place', 20, 'Last one — finish strong!'],
      ],
      now
    ),
  ];
}
