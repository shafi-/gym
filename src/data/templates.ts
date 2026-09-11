import type { WorkoutType } from '../models/plan.model';

export type MuscleGroup =
  | 'full-body'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'legs'
  | 'glutes';

export type Equipment =
  | 'none'
  | 'mat'
  | 'chair'
  | 'wall'
  | 'pull-up-bar'
  | 'dumbbells'
  | 'kettlebell'
  | 'resistance-band'
  | 'jump-rope';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  duration: number | null; // seconds (HIIT/Yoga, timed strength holds)
  reps: number | null; // (Strength)
  notes: string;
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  'full-body': 'Full Body',
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
  legs: 'Legs',
  glutes: 'Glutes',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'No equipment',
  mat: 'Mat',
  chair: 'Chair',
  wall: 'Wall',
  'pull-up-bar': 'Pull-up bar',
  dumbbells: 'Dumbbells',
  kettlebell: 'Kettlebell',
  'resistance-band': 'Resistance band',
  'jump-rope': 'Jump rope',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  'full-body',
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
  'glutes',
];

export const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

/** Equipment treated as "bodyweight friendly" (nothing to buy or set up). */
export const BODYWEIGHT_EQUIPMENT: Equipment[] = ['none', 'mat'];

/**
 * Predefined exercise templates users can pick from when building a plan.
 * Grouped by workout type, filterable by muscle group, difficulty and equipment.
 */
export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // ── HIIT / Cardio ────────────────────────────────────────────────
  { id: 'hiit-1', name: 'Jumping Jacks', type: 'hiit', muscleGroups: ['full-body'], equipment: ['none'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Keep a steady pace, land softly.' },
  { id: 'hiit-2', name: 'High Knees', type: 'hiit', muscleGroups: ['legs', 'core'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Drive knees up to hip height.' },
  { id: 'hiit-3', name: 'Burpees', type: 'hiit', muscleGroups: ['full-body'], equipment: ['none'], difficulty: 'advanced', duration: 30, reps: null, notes: 'Full extension at the top.' },
  { id: 'hiit-4', name: 'Mountain Climbers', type: 'hiit', muscleGroups: ['core'], equipment: ['none'], difficulty: 'intermediate', duration: 45, reps: null, notes: 'Keep hips level, quick feet.' },
  { id: 'hiit-5', name: 'Sprint in Place', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'intermediate', duration: 20, reps: null, notes: 'Maximum effort.' },
  { id: 'hiit-6', name: 'Skaters', type: 'hiit', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Leap side to side, stick the landing.' },
  { id: 'hiit-7', name: 'Butt Kicks', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Heels touch glutes.' },
  { id: 'hiit-8', name: 'Plank Jacks', type: 'hiit', muscleGroups: ['core', 'shoulders'], equipment: ['none'], difficulty: 'intermediate', duration: 45, reps: null, notes: 'Keep core tight, jump feet wide.' },
  { id: 'hiit-9', name: 'Squat Jumps', type: 'hiit', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Land soft, sink into the next rep.' },
  { id: 'hiit-10', name: 'Star Jumps', type: 'hiit', muscleGroups: ['full-body'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Explode wide, snap back tight.' },
  { id: 'hiit-11', name: 'Tuck Jumps', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'advanced', duration: 20, reps: null, notes: 'Knees to chest, minimal ground time.' },
  { id: 'hiit-12', name: 'Split Jumps', type: 'hiit', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Switch legs mid-air, torso tall.' },
  { id: 'hiit-13', name: 'Frog Jumps', type: 'hiit', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Wide stance, touch the floor between jumps.' },
  { id: 'hiit-14', name: 'Broad Jumps', type: 'hiit', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Jump forward, stick each landing.' },
  { id: 'hiit-15', name: 'Ski Jumps', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Feet together, hop side to side.' },
  { id: 'hiit-16', name: 'Pop Squats', type: 'hiit', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Jump feet out to a squat, hop them back in.' },
  { id: 'hiit-17', name: 'Jump Rope', type: 'hiit', muscleGroups: ['legs'], equipment: ['jump-rope'], difficulty: 'intermediate', duration: 45, reps: null, notes: 'Wrists do the work, low bounces.' },
  { id: 'hiit-18', name: 'Shadow Boxing', type: 'hiit', muscleGroups: ['full-body'], equipment: ['none'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Move your feet, snap punches out.' },
  { id: 'hiit-19', name: 'Cross Jabs', type: 'hiit', muscleGroups: ['core', 'shoulders'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Pivot the back foot with every punch.' },
  { id: 'hiit-20', name: 'Front Kicks', type: 'hiit', muscleGroups: ['legs', 'core'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Alternate legs, stay light on the standing foot.' },
  { id: 'hiit-21', name: 'Bear Crawl', type: 'hiit', muscleGroups: ['full-body', 'core'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Knees hover, hips low and level.' },
  { id: 'hiit-22', name: 'Crab Toe Touches', type: 'hiit', muscleGroups: ['core', 'full-body'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Hips high, tap opposite hand to toe.' },
  { id: 'hiit-23', name: 'Inchworms', type: 'hiit', muscleGroups: ['core', 'shoulders'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Walk hands out to a plank, walk feet in.' },
  { id: 'hiit-24', name: 'Kick Throughs', type: 'hiit', muscleGroups: ['core', 'full-body'], equipment: ['none'], difficulty: 'advanced', duration: 30, reps: null, notes: 'Rotate and kick across the body.' },
  { id: 'hiit-25', name: 'Sit-Outs', type: 'hiit', muscleGroups: ['core'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Twist through the waist, hips stay low.' },
  { id: 'hiit-26', name: 'Burpee Step-Backs', type: 'hiit', muscleGroups: ['full-body'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Low-impact: step back instead of jumping.' },
  { id: 'hiit-27', name: 'Seal Jacks', type: 'hiit', muscleGroups: ['chest', 'shoulders'], equipment: ['none'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Arms sweep open and clap in front.' },
  { id: 'hiit-28', name: 'Step Jacks', type: 'hiit', muscleGroups: ['full-body'], equipment: ['none'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Low-impact jumping jack, alternate stepping out.' },
  { id: 'hiit-29', name: 'March in Place', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Pump the arms, lift the knees.' },
  { id: 'hiit-30', name: 'Fast Feet', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Tiny quick steps, stay on the balls of your feet.' },
  { id: 'hiit-31', name: 'Side Shuffles', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Stay low, shuffle wide and quick.' },
  { id: 'hiit-32', name: 'Power Skips', type: 'hiit', muscleGroups: ['legs', 'full-body'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Drive the opposite knee and arm up high.' },
  { id: 'hiit-33', name: 'Speed Squats', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Fast but full depth, chest up.' },
  { id: 'hiit-34', name: 'Reverse Lunge Kicks', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Lunge back, then kick the same leg forward.' },
  { id: 'hiit-35', name: 'Plank Shoulder Taps', type: 'hiit', muscleGroups: ['core', 'shoulders'], equipment: ['none'], difficulty: 'intermediate', duration: 40, reps: null, notes: 'Feet wide, resist the hip sway.' },
  { id: 'hiit-36', name: 'Bicycle Crunches', type: 'hiit', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: 40, reps: null, notes: 'Elbow toward the opposite knee, slow and controlled.' },
  { id: 'hiit-37', name: 'Flutter Kicks', type: 'hiit', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: 40, reps: null, notes: 'Lower back pressed down, small quick kicks.' },
  { id: 'hiit-38', name: 'Arm Circles', type: 'hiit', muscleGroups: ['shoulders'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Warm-up: big circles forward, then back.' },
  { id: 'hiit-39', name: 'Torso Twists', type: 'hiit', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Warm-up: twist from the waist, arms loose.' },
  { id: 'hiit-40', name: 'Hip Circles', type: 'hiit', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Warm-up: big slow circles, both directions.' },

  // ── Strength ─────────────────────────────────────────────────────
  { id: 'str-1', name: 'Push-ups', type: 'strength', muscleGroups: ['chest', 'shoulders', 'arms'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 15, notes: 'Chest to floor, full lockout.' },
  { id: 'str-2', name: 'Bodyweight Squats', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 20, notes: 'Hips below knees, chest up.' },
  { id: 'str-3', name: 'Lunges', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Back knee nearly touches ground.' },
  { id: 'str-4', name: 'Pike Push-ups', type: 'strength', muscleGroups: ['shoulders'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Hips high, head toward floor.' },
  { id: 'str-5', name: 'Tricep Dips', type: 'strength', muscleGroups: ['arms', 'chest'], equipment: ['chair'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Use a chair or low surface.' },
  { id: 'str-6', name: 'Wall Sit', type: 'strength', muscleGroups: ['legs'], equipment: ['wall'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Thighs parallel to floor.' },
  { id: 'str-7', name: 'Calf Raises', type: 'strength', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 20, notes: 'Full range of motion, pause at top.' },
  { id: 'str-8', name: 'Diamond Push-ups', type: 'strength', muscleGroups: ['chest', 'arms'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 8, notes: 'Hands together under chest.' },
  { id: 'str-9', name: 'Knee Push-ups', type: 'strength', muscleGroups: ['chest', 'arms'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Body straight from head to knees.' },
  { id: 'str-10', name: 'Wide Push-ups', type: 'strength', muscleGroups: ['chest', 'shoulders'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Hands wider than shoulders.' },
  { id: 'str-11', name: 'Incline Push-ups', type: 'strength', muscleGroups: ['chest', 'arms'], equipment: ['chair'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Hands on a chair or step, body rigid.' },
  { id: 'str-12', name: 'Decline Push-ups', type: 'strength', muscleGroups: ['chest', 'shoulders'], equipment: ['chair'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Feet on a chair, core braced.' },
  { id: 'str-13', name: 'Archer Push-ups', type: 'strength', muscleGroups: ['chest', 'arms'], equipment: ['none'], difficulty: 'advanced', duration: null, reps: 6, notes: 'Shift weight over the bending arm.' },
  { id: 'str-14', name: 'Explosive Push-ups', type: 'strength', muscleGroups: ['chest', 'shoulders'], equipment: ['none'], difficulty: 'advanced', duration: null, reps: 6, notes: 'Hands leave the floor on each rep.' },
  { id: 'str-15', name: 'Hindu Push-ups', type: 'strength', muscleGroups: ['shoulders', 'chest'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Swoop from pike through to upward dog.' },
  { id: 'str-16', name: 'Wall Push-ups', type: 'strength', muscleGroups: ['chest', 'arms'], equipment: ['wall'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Stand arm\'s length from the wall.' },
  { id: 'str-17', name: 'Dumbbell Floor Press', type: 'strength', muscleGroups: ['chest', 'arms'], equipment: ['dumbbells'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Lie on your back, elbows to the floor.' },
  { id: 'str-18', name: 'Dumbbell Shoulder Press', type: 'strength', muscleGroups: ['shoulders'], equipment: ['dumbbells'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Ribs down, press overhead to lockout.' },
  { id: 'str-19', name: 'Lateral Raise', type: 'strength', muscleGroups: ['shoulders'], equipment: ['dumbbells'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Raise to shoulder height, pinkies slightly up.' },
  { id: 'str-20', name: 'Dumbbell Curls', type: 'strength', muscleGroups: ['arms'], equipment: ['dumbbells'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Elbows pinned to your sides.' },
  { id: 'str-21', name: 'Dumbbell Thrusters', type: 'strength', muscleGroups: ['full-body', 'legs'], equipment: ['dumbbells'], difficulty: 'intermediate', duration: null, reps: 12, notes: 'Squat then press in one fluid motion.' },
  { id: 'str-22', name: 'Pull-ups', type: 'strength', muscleGroups: ['back', 'arms'], equipment: ['pull-up-bar'], difficulty: 'advanced', duration: null, reps: 6, notes: 'Chest to the bar, no swinging.' },
  { id: 'str-23', name: 'Chin-ups', type: 'strength', muscleGroups: ['back', 'arms'], equipment: ['pull-up-bar'], difficulty: 'advanced', duration: null, reps: 8, notes: 'Palms facing you, chin over bar.' },
  { id: 'str-24', name: 'Inverted Rows', type: 'strength', muscleGroups: ['back', 'arms'], equipment: ['pull-up-bar'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Body straight, pull chest to the bar.' },
  { id: 'str-25', name: 'Band Pull-Aparts', type: 'strength', muscleGroups: ['back', 'shoulders'], equipment: ['resistance-band'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Straight arms, squeeze shoulder blades.' },
  { id: 'str-26', name: 'Band Rows', type: 'strength', muscleGroups: ['back', 'arms'], equipment: ['resistance-band'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Anchor at chest height, pull elbows back.' },
  { id: 'str-27', name: 'Face Pulls', type: 'strength', muscleGroups: ['shoulders', 'back'], equipment: ['resistance-band'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Pull toward your forehead, thumbs back.' },
  { id: 'str-28', name: 'Supermans', type: 'strength', muscleGroups: ['back', 'glutes'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Lift arms and legs, gaze down.' },
  { id: 'str-29', name: 'Swimmers', type: 'strength', muscleGroups: ['back', 'shoulders'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Alternate lifting opposite arm and leg.' },
  { id: 'str-30', name: 'Kettlebell Swings', type: 'strength', muscleGroups: ['full-body', 'legs'], equipment: ['kettlebell'], difficulty: 'intermediate', duration: null, reps: 15, notes: 'Hip hinge, the bell floats to chest height.' },
  { id: 'str-31', name: 'Goblet Squats', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['kettlebell'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Hold the bell at your chest, elbows in.' },
  { id: 'str-32', name: 'Reverse Lunges', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Step back, torso upright.' },
  { id: 'str-33', name: 'Side Lunges', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 10, notes: 'Sit back into one hip, other leg straight.' },
  { id: 'str-34', name: 'Curtsy Lunges', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Back leg crosses behind, hips square.' },
  { id: 'str-35', name: 'Bulgarian Split Squats', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['chair'], difficulty: 'intermediate', duration: null, reps: 8, notes: 'Rear foot on a chair, sink straight down.' },
  { id: 'str-36', name: 'Step-Ups', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['chair'], difficulty: 'beginner', duration: null, reps: 10, notes: 'Drive through the top foot, no pushing off the floor.' },
  { id: 'str-37', name: 'Single-Leg Deadlift', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Hinge at the hip, back stays flat.' },
  { id: 'str-38', name: 'Glute Bridge', type: 'strength', muscleGroups: ['glutes', 'core'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Squeeze glutes hard at the top.' },
  { id: 'str-39', name: 'Single-Leg Glute Bridge', type: 'strength', muscleGroups: ['glutes'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 10, notes: 'Hips level throughout the rep.' },
  { id: 'str-40', name: 'Sumo Squats', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Wide stance, toes slightly out.' },
  { id: 'str-41', name: 'Pistol Squats', type: 'strength', muscleGroups: ['legs'], equipment: ['none'], difficulty: 'advanced', duration: null, reps: 5, notes: 'One leg extended, heel stays down.' },
  { id: 'str-42', name: 'Plank', type: 'strength', muscleGroups: ['core', 'shoulders'], equipment: ['none'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Squeeze glutes, don\'t sag the hips.' },
  { id: 'str-43', name: 'Side Plank', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Stack the feet, hips high.' },
  { id: 'str-44', name: 'Crunches', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 20, notes: 'Curl the ribs toward the hips, no pulling on the neck.' },
  { id: 'str-45', name: 'Reverse Crunches', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 15, notes: 'Knees to chest, lower back stays down.' },
  { id: 'str-46', name: 'Russian Twists', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 20, notes: 'Chest up, rotate side to side.' },
  { id: 'str-47', name: 'Leg Raises', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'intermediate', duration: null, reps: 12, notes: 'Slow descent, hands under the hips if needed.' },
  { id: 'str-48', name: 'Hollow Hold', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Lower back glued to the floor.' },
  { id: 'str-49', name: 'Dead Bug', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 12, notes: 'Extend opposite arm and leg slowly.' },
  { id: 'str-50', name: 'Bird Dog', type: 'strength', muscleGroups: ['core', 'back'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 10, notes: 'Reach long, hips stay level.' },
  { id: 'str-51', name: 'V-Ups', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'advanced', duration: null, reps: 12, notes: 'Touch the toes, control the way down.' },
  { id: 'str-52', name: 'Heel Taps', type: 'strength', muscleGroups: ['core'], equipment: ['none'], difficulty: 'beginner', duration: null, reps: 20, notes: 'Knees up, tap each heel to the floor.' },
  { id: 'str-53', name: 'Plank Up-Downs', type: 'strength', muscleGroups: ['core', 'shoulders'], equipment: ['none'], difficulty: 'intermediate', duration: 30, reps: null, notes: 'Lead with the same arm, minimize hip sway.' },

  // ── Yoga / Stretch ───────────────────────────────────────────────
  { id: 'yoga-1', name: 'Downward Dog', type: 'yoga', muscleGroups: ['full-body', 'legs'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Hips high, heels reaching down.' },
  { id: 'yoga-2', name: 'Warrior I', type: 'yoga', muscleGroups: ['legs', 'glutes'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Front knee at 90°, back foot flat.' },
  { id: 'yoga-3', name: 'Warrior II', type: 'yoga', muscleGroups: ['legs'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Arms extended, gaze over front hand.' },
  { id: 'yoga-4', name: 'Tree Pose', type: 'yoga', muscleGroups: ['legs'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Foot on inner thigh, hands at heart.' },
  { id: 'yoga-5', name: 'Child\'s Pose', type: 'yoga', muscleGroups: ['back'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Knees wide, arms extended forward.' },
  { id: 'yoga-6', name: 'Cobra Pose', type: 'yoga', muscleGroups: ['back', 'chest'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Lift chest, shoulders back and down.' },
  { id: 'yoga-7', name: 'Pigeon Pose', type: 'yoga', muscleGroups: ['glutes', 'legs'], equipment: ['mat'], difficulty: 'intermediate', duration: 60, reps: null, notes: 'Hips square, fold forward.' },
  { id: 'yoga-8', name: 'Seated Forward Fold', type: 'yoga', muscleGroups: ['legs', 'back'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Hinge at hips, reach for toes.' },
  { id: 'yoga-9', name: 'Mountain Pose', type: 'yoga', muscleGroups: ['full-body'], equipment: ['mat'], difficulty: 'beginner', duration: 30, reps: null, notes: 'Stand tall, weight even across both feet.' },
  { id: 'yoga-10', name: 'Chair Pose', type: 'yoga', muscleGroups: ['legs', 'glutes'], equipment: ['mat'], difficulty: 'intermediate', duration: 45, reps: null, notes: 'Sit back like into a chair, arms overhead.' },
  { id: 'yoga-11', name: 'Triangle Pose', type: 'yoga', muscleGroups: ['legs', 'back'], equipment: ['mat'], difficulty: 'intermediate', duration: 45, reps: null, notes: 'Legs straight, reach long over the front foot.' },
  { id: 'yoga-12', name: 'Extended Side Angle', type: 'yoga', muscleGroups: ['legs'], equipment: ['mat'], difficulty: 'intermediate', duration: 45, reps: null, notes: 'Front knee bent, chest opens to the side.' },
  { id: 'yoga-13', name: 'Crescent Lunge', type: 'yoga', muscleGroups: ['legs', 'glutes'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Back heel lifted, sink the front knee.' },
  { id: 'yoga-14', name: 'Low Lunge', type: 'yoga', muscleGroups: ['legs', 'glutes'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Back knee down, hips press forward.' },
  { id: 'yoga-15', name: 'Eagle Pose', type: 'yoga', muscleGroups: ['shoulders', 'legs'], equipment: ['mat'], difficulty: 'advanced', duration: 45, reps: null, notes: 'Wrap arms and legs, sit low.' },
  { id: 'yoga-16', name: 'Standing Forward Fold', type: 'yoga', muscleGroups: ['legs', 'back'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Soft knees, let the head hang heavy.' },
  { id: 'yoga-17', name: 'Warrior III', type: 'yoga', muscleGroups: ['legs', 'core'], equipment: ['mat'], difficulty: 'advanced', duration: 45, reps: null, notes: 'Hips level, body forms a T.' },
  { id: 'yoga-18', name: 'Half Moon', type: 'yoga', muscleGroups: ['legs', 'core'], equipment: ['mat'], difficulty: 'advanced', duration: 45, reps: null, notes: 'Stack the hips, gaze up if steady.' },
  { id: 'yoga-19', name: 'Cat-Cow', type: 'yoga', muscleGroups: ['back', 'core'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Move slowly with the breath.' },
  { id: 'yoga-20', name: 'Sphinx Pose', type: 'yoga', muscleGroups: ['back', 'chest'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Forearms down, gentle lower-back arch.' },
  { id: 'yoga-21', name: 'Bridge Pose', type: 'yoga', muscleGroups: ['glutes', 'back'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Feet hip-width, lift the chest to the chin.' },
  { id: 'yoga-22', name: 'Supine Twist', type: 'yoga', muscleGroups: ['back', 'glutes'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Knees drop to one side, shoulders grounded.' },
  { id: 'yoga-23', name: 'Happy Baby', type: 'yoga', muscleGroups: ['glutes', 'legs'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Grab the outer feet, knees toward armpits.' },
  { id: 'yoga-24', name: 'Butterfly Pose', type: 'yoga', muscleGroups: ['legs'], equipment: ['mat'], difficulty: 'beginner', duration: 60, reps: null, notes: 'Soles together, knees sink toward the floor.' },
  { id: 'yoga-25', name: 'Seated Spinal Twist', type: 'yoga', muscleGroups: ['back'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Lengthen on the inhale, twist on the exhale.' },
  { id: 'yoga-26', name: 'Half Splits', type: 'yoga', muscleGroups: ['legs'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Front leg straight, hips reach back.' },
  { id: 'yoga-27', name: 'Thread the Needle', type: 'yoga', muscleGroups: ['shoulders', 'back'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Slide one arm under, cheek to the mat.' },
  { id: 'yoga-28', name: 'Puppy Pose', type: 'yoga', muscleGroups: ['shoulders', 'back'], equipment: ['mat'], difficulty: 'beginner', duration: 45, reps: null, notes: 'Hips over knees, chest melts toward the mat.' },
  { id: 'yoga-29', name: 'Legs Up the Wall', type: 'yoga', muscleGroups: ['legs'], equipment: ['wall'], difficulty: 'beginner', duration: 90, reps: null, notes: 'Hips close to the wall, legs relaxed.' },
  { id: 'yoga-30', name: 'Corpse Pose', type: 'yoga', muscleGroups: ['full-body'], equipment: ['mat'], difficulty: 'beginner', duration: 90, reps: null, notes: 'Lie flat, palms up, breathe slowly.' },
];

export const TEMPLATE_GROUPS: { type: WorkoutType; label: string }[] = [
  { type: 'hiit', label: 'HIIT / Cardio' },
  { type: 'strength', label: 'Strength' },
  { type: 'yoga', label: 'Yoga / Stretch' },
];
