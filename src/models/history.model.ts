export interface SessionHistory {
  id: string;
  planId: string;
  planName: string;
  startedAt: number;
  completedAt: number;
  totalDuration: number; // seconds
  stagesCompleted: number;
  completed: boolean;
}
