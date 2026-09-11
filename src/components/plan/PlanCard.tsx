import type { Plan } from '../../models/plan.model';
import { WORKOUT_TYPE_META } from '../../lib/workout-type';
import { IconButton } from '../ui/IconButton';
import { Copy, Trash2 } from 'lucide-react';

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
  const meta = WORKOUT_TYPE_META[plan.type];
  const TypeIcon = meta.icon;
  const totalDuration = plan.stages.reduce(
    (sum, stage) => sum + (stage.duration ?? 0),
    0
  );

  return (
    <div className="mb-3 flex items-stretch bg-surface rounded-xl border border-line shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-0 flex items-center gap-3 p-4 text-left hover:bg-surface-2 transition-colors"
      >
        <span
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.chipClass}`}
          aria-hidden
        >
          <TypeIcon size={20} className={meta.iconClass} />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-ink truncate">{plan.name}</span>
            {plan.isStarter && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand-soft text-brand shrink-0">
                Starter
              </span>
            )}
          </span>
          <span className="block text-sm text-ink-2 mt-0.5 tabular">
            {meta.label} · {plan.stages.length} stages · {formatDuration(totalDuration)}
          </span>
        </span>
      </button>
      <div className="flex items-center gap-0.5 pr-2">
        <IconButton label="Copy plan" onClick={onDuplicate}>
          <Copy size={18} />
        </IconButton>
        <IconButton label="Delete plan" variant="danger" onClick={onDelete}>
          <Trash2 size={18} />
        </IconButton>
      </div>
    </div>
  );
}
