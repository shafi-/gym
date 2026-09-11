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

const typeConfig = {
  hiit: { emoji: '🏃', color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  strength: { emoji: '💪', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  yoga: { emoji: '🧘', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export function PlanCard({ plan, onSelect, onDelete, onDuplicate }: PlanCardProps) {
  const totalDuration = plan.stages.reduce(
    (sum, stage) => sum + (stage.duration ?? 0),
    0
  );

  const config = typeConfig[plan.type];

  return (
    <Card className="mb-3 overflow-hidden">
      <div className={`flex items-start justify-between border-l-4 ${config.color.replace('bg-', 'border-')}`}>
        <div className="flex-1 cursor-pointer p-1" onClick={onSelect}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
            {plan.isStarter && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                Starter
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.lightColor}`}>
              {plan.type}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            {plan.stages.length} stages · {formatDuration(totalDuration)}
          </p>
        </div>
        <div className="flex gap-2 pt-1">
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
