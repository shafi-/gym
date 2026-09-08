import type { Plan } from '../../models/plan.model';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface PlanDetailPageProps {
  plan: Plan;
  onStartSession: () => void;
  onEdit: () => void;
  onBack: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function PlanDetailPage({ plan, onStartSession, onEdit, onBack }: PlanDetailPageProps) {
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-primary-600 font-medium">
          ← Back
        </button>
        <button onClick={onEdit} className="text-primary-600 font-medium">
          Edit
        </button>
      </header>

      <main className="p-4">
        <div className="text-center mb-6">
          <span className="text-4xl">{typeEmoji[plan.type]}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{plan.name}</h1>
          <p className="text-gray-500">
            {plan.stages.length} stages · {formatDuration(totalDuration)}
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={onStartSession} size="lg" className="w-full">
            Start Session
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">Stages</h2>
        <div className="space-y-2">
          {plan.stages.map((stage, index) => (
            <Card key={stage.id}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-gray-800">{stage.name}</span>
                <span className="text-sm text-gray-500">
                  {stage.duration ? `${stage.duration}s` : stage.reps ? `${stage.reps} reps` : ''}
                </span>
                {stage.mediaId && <span className="text-sm">📷</span>}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
