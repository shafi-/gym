import { useState } from 'react';
import { Film, Image as ImageIcon, Pencil, Play, Trash2 } from 'lucide-react';
import type { Plan } from '../../models/plan.model';
import { WORKOUT_TYPE_META } from '../../lib/workout-type';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageLayout } from '../../components/ui/PageLayout';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomActionBar } from '../../components/ui/BottomActionBar';
import { IconButton } from '../../components/ui/IconButton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { audioService } from '../../services/audio.service';
import { voiceService } from '../../services/voice.service';

interface PlanDetailPageProps {
  plan: Plan;
  onStartSession: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function PlanDetailPage({ plan, onStartSession, onEdit, onDelete, onBack }: PlanDetailPageProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const workDuration = plan.stages.reduce((sum, stage) => sum + (stage.duration ?? 0), 0);
  const restDuration =
    Math.max(plan.stages.length - 1, 0) * plan.restBetweenStages;
  const estimated = workDuration + restDuration;

  const meta = WORKOUT_TYPE_META[plan.type];
  const TypeIcon = meta.icon;

  return (
    <PageLayout>
      <ScreenHeader
        title={plan.name}
        onBack={onBack}
        actions={
          <>
            <IconButton label="Edit plan" onClick={onEdit}>
              <Pencil size={19} />
            </IconButton>
            <IconButton label="Delete plan" variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={19} />
            </IconButton>
          </>
        }
      />

      <main className="p-4">
        <div className="text-center mb-6 animate-fade-in">
          <span
            className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${meta.chipClass}`}
            aria-hidden
          >
            <TypeIcon size={30} className={meta.iconClass} />
          </span>
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-3">{meta.label}</h2>
          <p className="text-ink-2 mt-1 tabular">
            {plan.stages.length} stages · ~{formatDuration(estimated)} with rest
          </p>
        </div>

        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-3 mb-3">Stages</h3>
        <ol className="space-y-2">
          {plan.stages.map((stage, index) => {
            const MediaIcon = stage.mediaType === 'video' ? Film : ImageIcon;
            return (
              <li key={stage.id}>
                <Card className="!p-3 flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-brand-soft text-brand rounded-full text-xs font-semibold shrink-0 tabular">
                    {index + 1}
                  </span>
                  <span className="flex-1 min-w-0 font-medium text-ink truncate">{stage.name}</span>
                  {stage.mediaId && <MediaIcon size={16} className="text-ink-3 shrink-0" aria-label="Has media" />}
                  <span className="text-sm text-ink-2 shrink-0 tabular">
                    {stage.duration ? `${stage.duration}s` : stage.reps ? `${stage.reps} reps` : ''}
                  </span>
                </Card>
              </li>
            );
          })}
        </ol>
      </main>

      <BottomActionBar>
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            // Inside this gesture: unlock audio (and prime speech synthesis)
            // so the session route mounts with audio ready and skips its
            // Ready gate. If the unlock fails to land, the gate still shows
            // there — verified-state fallback, never a silent session.
            void audioService.unlock();
            voiceService.prime();
            onStartSession();
          }}
        >
          <Play size={18} aria-hidden />
          Start Session
        </Button>
      </BottomActionBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Plan"
        message={`Delete "${plan.name}"? This also removes its media and cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </PageLayout>
  );
}
