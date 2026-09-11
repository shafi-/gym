export type WorkoutType = 'hiit' | 'strength' | 'yoga';

export interface Stage {
  id: string;
  planId: string;
  order: number;
  name: string;
  mediaType: 'image' | 'video' | null;
  mediaId: string | null;
  duration: number | null; // seconds (HIIT/Yoga)
  reps: number | null; // (Strength)
  notes: string;
  restAfter: number | null; // seconds, overrides plan default
}

export interface Plan {
  id: string;
  name: string;
  type: WorkoutType;
  stages: Stage[];
  restBetweenStages: number; // seconds
  createdAt: number;
  updatedAt: number;
  /** Set on bundled starter plans seeded on first launch. */
  isStarter?: boolean;
}

export interface CreatePlanDTO {
  name: string;
  type: WorkoutType;
  stages: Omit<Stage, 'id' | 'planId' | 'order'>[];
  restBetweenStages?: number;
}
