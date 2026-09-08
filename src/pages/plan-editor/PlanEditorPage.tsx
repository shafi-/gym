import { useState, useEffect } from 'react';
import type { Plan, WorkoutType, Stage } from '../../models/plan.model';
import { StageRow } from '../../components/plan/StageRow';
import { StageEditorModal } from '../../components/plan/StageEditorModal';
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

  // Stage editor modal state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (editingIndex === null) {
      setPreviewSrc(null);
      return;
    }
    const stage = stages[editingIndex];
    if (!stage?.mediaId) {
      setPreviewSrc(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPreview() {
      const media = await mediaService.getMediaById(stage.mediaId!);
      if (cancelled || !media) return;
      objectUrl = URL.createObjectURL(media.blob);
      setPreviewSrc(objectUrl);
    }
    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [editingIndex]);

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
    // Immediately open the editor for the new stage
    setEditingIndex(stages.length);
  }

  function handleUpdateStage(index: number, updates: Partial<Stage>) {
    const updated = [...stages];
    updated[index] = { ...updated[index], ...updates };
    setStages(updated);
  }

  function handleDeleteStage(index: number) {
    setStages(stages.filter((_, i) => i !== index));
  }

  function handleSaveStage(updates: Partial<Stage>) {
    if (editingIndex !== null) {
      handleUpdateStage(editingIndex, updates);
    }
    setEditingIndex(null);
  }

  async function handleUploadMedia(file: File) {
    if (editingIndex === null) return;
    try {
      const media = await mediaService.uploadMedia(file);
      if (previewSrc) URL.revokeObjectURL(previewSrc);
      setPreviewSrc(URL.createObjectURL(media.blob));
      handleUpdateStage(editingIndex, {
        mediaId: media.id,
        mediaType: file.type.startsWith('video') ? 'video' : 'image',
      });
    } catch (err) {
      setError('Failed to upload media. Please try again.');
      console.error('Media upload failed:', err);
    }
  }

  async function handleReplayPreview() {
    // Re-fetch from store and regenerate a fresh blob URL to force replay.
    const stage = editingIndex !== null ? stages[editingIndex] : null;
    if (!stage?.mediaId) return;
    const media = await mediaService.getMediaById(stage.mediaId);
    if (!media) return;
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    setPreviewSrc(URL.createObjectURL(media.blob));
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

      let saved: Plan;
      if (plan) {
        saved = await planService.updatePlan({
          ...plan,
          name,
          type,
          stages,
          restBetweenStages,
        });
      } else {
        saved = await planService.createPlan({
          name,
          type,
          stages: stages.map(({ id: _id, planId: _pid, order: _order, ...stage }) => stage),
          restBetweenStages,
        });
      }
      onSave(saved);
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
          </div>

          <div className="space-y-2">
            {stages.map((stage, index) => (
              <StageRow
                key={stage.id}
                stage={stage}
                index={index}
                onEdit={() => setEditingIndex(index)}
                onDelete={() => handleDeleteStage(index)}
              />
            ))}
          </div>

          <button
            onClick={handleAddStage}
            className="w-full mt-3 py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 font-medium hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add New Stage</span>
          </button>
        </div>
      </main>

      <StageEditorModal
        open={editingIndex !== null}
        stage={editingIndex !== null ? stages[editingIndex] : null}
        planType={type}
        onClose={() => setEditingIndex(null)}
        onSave={handleSaveStage}
        onUploadMedia={handleUploadMedia}
        previewSrc={previewSrc}
        onReplay={handleReplayPreview}
      />
    </div>
  );
}
