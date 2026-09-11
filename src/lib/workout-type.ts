import { Dumbbell, Flame, Flower2, type LucideIcon } from 'lucide-react';
import type { WorkoutType } from '../models/plan.model';

/** Shared per-workout-type visuals (icon + tokenized accent classes). */
export const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { label: string; icon: LucideIcon; iconClass: string; chipClass: string }
> = {
  hiit: {
    label: 'HIIT',
    icon: Flame,
    iconClass: 'text-type-hiit',
    chipClass: 'bg-type-hiit-soft',
  },
  strength: {
    label: 'Strength',
    icon: Dumbbell,
    iconClass: 'text-type-strength',
    chipClass: 'bg-type-strength-soft',
  },
  yoga: {
    label: 'Yoga',
    icon: Flower2,
    iconClass: 'text-type-yoga',
    chipClass: 'bg-type-yoga-soft',
  },
};
