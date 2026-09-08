import { SessionContainer } from '../../containers/session/SessionContainer';
import type { Plan } from '../../models/plan.model';

interface SessionPageProps {
  plan: Plan;
  onComplete: (duration: number, stagesCompleted: number) => void;
  onCancel: () => void;
}

export function SessionPage({ plan, onComplete, onCancel }: SessionPageProps) {
  return (
    <SessionContainer
      plan={plan}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  );
}
