import type { WorkoutType } from '../models/plan.model';

export interface ExerciseTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  duration: number | null; // seconds (HIIT/Yoga)
  reps: number | null; // (Strength)
  notes: string;
}

/**
 * Predefined exercise templates users can pick from when building a plan.
 * Grouped by workout type for easy browsing.
 */
export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // HIIT
  { id: 'hiit-1', name: 'Jumping Jacks', type: 'hiit', duration: 45, reps: null, notes: 'Keep a steady pace, land softly.' },
  { id: 'hiit-2', name: 'High Knees', type: 'hiit', duration: 30, reps: null, notes: 'Drive knees up to hip height.' },
  { id: 'hiit-3', name: 'Burpees', type: 'hiit', duration: 30, reps: null, notes: 'Full extension at the top.' },
  { id: 'hiit-4', name: 'Mountain Climbers', type: 'hiit', duration: 45, reps: null, notes: 'Keep hips level, quick feet.' },
  { id: 'hiit-5', name: 'Sprint in Place', type: 'hiit', duration: 20, reps: null, notes: 'Maximum effort.' },
  { id: 'hiit-6', name: 'Skaters', type: 'hiit', duration: 30, reps: null, notes: 'Leap side to side, stick the landing.' },
  { id: 'hiit-7', name: 'Butt Kicks', type: 'hiit', duration: 30, reps: null, notes: 'Heels touch glutes.' },
  { id: 'hiit-8', name: 'Plank Jacks', type: 'hiit', duration: 45, reps: null, notes: 'Keep core tight, jump feet wide.' },

  // Strength
  { id: 'str-1', name: 'Push-ups', type: 'strength', duration: null, reps: 15, notes: 'Chest to floor, full lockout.' },
  { id: 'str-2', name: 'Bodyweight Squats', type: 'strength', duration: null, reps: 20, notes: 'Hips below knees, chest up.' },
  { id: 'str-3', name: 'Lunges', type: 'strength', duration: null, reps: 12, notes: 'Back knee nearly touches ground.' },
  { id: 'str-4', name: 'Pike Push-ups', type: 'strength', duration: null, reps: 10, notes: 'Hips high, head toward floor.' },
  { id: 'str-5', name: 'Tricep Dips', type: 'strength', duration: null, reps: 12, notes: 'Use a chair or low surface.' },
  { id: 'str-6', name: 'Wall Sit', type: 'strength', duration: 45, reps: null, notes: 'Thighs parallel to floor.' },
  { id: 'str-7', name: 'Calf Raises', type: 'strength', duration: null, reps: 20, notes: 'Full range of motion, pause at top.' },
  { id: 'str-8', name: 'Diamond Push-ups', type: 'strength', duration: null, reps: 8, notes: 'Hands together under chest.' },

  // Yoga
  { id: 'yoga-1', name: 'Downward Dog', type: 'yoga', duration: 60, reps: null, notes: 'Hips high, heels reaching down.' },
  { id: 'yoga-2', name: 'Warrior I', type: 'yoga', duration: 45, reps: null, notes: 'Front knee at 90°, back foot flat.' },
  { id: 'yoga-3', name: 'Warrior II', type: 'yoga', duration: 45, reps: null, notes: 'Arms extended, gaze over front hand.' },
  { id: 'yoga-4', name: 'Tree Pose', type: 'yoga', duration: 60, reps: null, notes: 'Foot on inner thigh, hands at heart.' },
  { id: 'yoga-5', name: 'Child\'s Pose', type: 'yoga', duration: 60, reps: null, notes: 'Knees wide, arms extended forward.' },
  { id: 'yoga-6', name: 'Cobra Pose', type: 'yoga', duration: 45, reps: null, notes: 'Lift chest, shoulders back and down.' },
  { id: 'yoga-7', name: 'Pigeon Pose', type: 'yoga', duration: 60, reps: null, notes: 'Hips square, fold forward.' },
  { id: 'yoga-8', name: 'Seated Forward Fold', type: 'yoga', duration: 60, reps: null, notes: 'Hinge at hips, reach for toes.' },
];

export const TEMPLATE_GROUPS: { type: WorkoutType; label: string; emoji: string }[] = [
  { type: 'hiit', label: 'HIIT / Cardio', emoji: '🏃' },
  { type: 'strength', label: 'Strength', emoji: '💪' },
  { type: 'yoga', label: 'Yoga / Stretch', emoji: '🧘' },
];
