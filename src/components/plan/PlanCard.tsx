import type { Plan } from '../../models/plan.model';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PlanCardProps {
  plan: Plan;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function PlanCard({ plan, onSelect, onDelete, onDuplicate }: PlanCardProps) {
  const totalDuration = plan.stages.reduce(
    (sum, stage) => sum + (stage.duration ?? 0),
    0
  );

  const typeEmoji = {
    hiit: '🏃',
    strength: '💪',
    yoga: '🧘',
  };

  return (
    <Card className="mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeEmoji[plan.type]}</span>
            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {plan.stages.length} stages · {formatDuration(totalDuration)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDuplicate}>
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            ✕
          </Button>
        </div>
      </div>
    </Card>
  );
}
