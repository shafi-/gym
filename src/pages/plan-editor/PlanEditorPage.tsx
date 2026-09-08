import { useState } from 'react';
import type { Plan, WorkoutType, Stage } from '../../models/plan.model';
import { Button } from '../../components/ui/Button';
import { StageRow } from '../../components/plan/StageRow';
import { PlanService } from '../../services/plan.service';
import { MediaService } from '../../services/media.service';

interface PlanEditorPageProps {
  plan?: Plan;
  onSave: (plan: Plan) => void;
  onCancel: () => void;
}

const planService = new PlanService();
const mediaService = new MediaService();

function generateId(): string {
  return crypto.randomUUID();
}

export function PlanEditorPage({ plan, onSave, onCancel }: PlanEditorPageProps) {
  const [name, setName] = useState(plan?.name ?? '');
  const [type, setType] = useState<WorkoutType>(plan?.type ?? 'hiit');
  const [stages, setStages] = useState<Stage[]>(plan?.stages ?? []);
  const [restBetweenStages, setRestBetweenStages] = useState(plan?.restBetweenStages ?? 30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddStage() {
    const newStage: Stage = {
      id: generateId(),
      planId: plan?.id ?? '',
      order: stages.length,
      name: `Stage ${stages.length + 1}`,
      mediaType: null,
      mediaId: null,
      duration: 30,
      reps: null,
      notes: '',
      restAfter: null,
    };
    setStages([...stages, newStage]);
  }

  function handleUpdateStage(index: number, updates: Partial<Stage>) {
    const updated = [...stages];
    updated[index] = { ...updated[index], ...updates };
    setStages(updated);
  }

  function handleDeleteStage(index: number) {
    setStages(stages.filter((_, i) => i !== index));
  }

  async function handleUploadMedia(stageIndex: number, file: File) {
    try {
      const media = await mediaService.uploadMedia(file);
      handleUpdateStage(stageIndex, {
        mediaId: media.id,
        mediaType: file.type.startsWith('video') ? 'video' : 'image',
      });
    } catch (err) {
      setError('Failed to upload media. Please try again.');
      console.error('Media upload failed:', err);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Please enter a plan name');
      return;
    }
    if (stages.length === 0) {
      setError('Please add at least one stage');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (plan) {
        const updated = await planService.updatePlan({
          ...plan,
          name,
          type,
          stages,
          restBetweenStages,
        });
        onSave(updated);
      } else {
        const created = await planService.createPlan({
          name,
          type,
          stages: stages.map(({ id: _id, planId: _pid, order: _order, ...stage }) => stage),
          restBetweenStages,
        });
        onSave(created);
      }
    } catch (err) {
      setError('Failed to save plan. Please try again.');
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="text-gray-600 font-medium">
          Cancel
        </button>
        <h1 className="font-semibold text-gray-900">
          {plan ? 'Edit Plan' : 'New Plan'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-primary-600 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <main className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Morning HIIT"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workout Type
          </label>
          <div className="flex gap-2">
            {(['hiit', 'strength', 'yoga'] as WorkoutType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium capitalize transition-colors ${
                  type === t
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rest Between Stages: {restBetweenStages}s
          </label>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={restBetweenStages}
            onChange={(e) => setRestBetweenStages(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Stages ({stages.length})
            </label>
            <button
              onClick={handleAddStage}
              className="text-sm text-primary-600 font-medium"
            >
              + Add Stage
            </button>
          </div>

          <div className="space-y-2">
            {stages.map((stage, index) => (
              <StageRow
                key={stage.id}
                stage={stage}
                index={index}
                onEdit={() => {
                  const newName = prompt('Stage name:', stage.name);
                  if (newName) handleUpdateStage(index, { name: newName });
                  const newDuration = prompt('Duration (seconds):', String(stage.duration ?? 30));
                  if (newDuration) handleUpdateStage(index, { duration: Number(newDuration) });
                }}
                onDelete={() => handleDeleteStage(index)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
