import { useMemo, useState, useEffect } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Dumbbell, Flame, Flower2, Plus, Sparkles } from 'lucide-react';
import type { Plan, WorkoutType, Stage } from '../../models/plan.model';
import { StageRow } from '../../components/plan/StageRow';
import { StageEditorModal } from '../../components/plan/StageEditorModal';
import { TemplatePicker } from '../../components/plan/TemplatePicker';
import { PageLayout } from '../../components/ui/PageLayout';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomActionBar } from '../../components/ui/BottomActionBar';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Slider } from '../../components/ui/Slider';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { inputClass, labelClass } from '../../components/ui/InputStyles';
import { PlanService } from '../../services/plan.service';
import { MediaService } from '../../services/media.service';
import type { ExerciseTemplate } from '../../data/templates';

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

const TYPE_OPTIONS = [
  { value: 'hiit' as const, label: 'HIIT', icon: Flame },
  { value: 'strength' as const, label: 'Strength', icon: Dumbbell },
  { value: 'yoga' as const, label: 'Yoga', icon: Flower2 },
];

export function PlanEditorPage({ plan, onSave, onCancel }: PlanEditorPageProps) {
  const [name, setName] = useState(plan?.name ?? '');
  const [type, setType] = useState<WorkoutType>(plan?.type ?? 'hiit');
  const [stages, setStages] = useState<Stage[]>(plan?.stages ?? []);
  const [restBetweenStages, setRestBetweenStages] = useState(plan?.restBetweenStages ?? 30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Stage editor modal state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Drag-reorder sensors: a small activation distance keeps vertical page
  // scrolling working on touch; keyboard users get arrow-key reordering.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Unsaved-changes detection for the back affordance.
  const isDirty = useMemo(() => {
    if (!plan) return name.trim() !== '' || stages.length > 0;
    return (
      name !== plan.name ||
      type !== plan.type ||
      restBetweenStages !== plan.restBetweenStages ||
      stages.length !== plan.stages.length ||
      stages.some((stage, i) => {
        const original = plan.stages[i];
        return (
          !original ||
          original.name !== stage.name ||
          original.duration !== stage.duration ||
          original.reps !== stage.reps ||
          original.notes !== stage.notes ||
          original.mediaId !== stage.mediaId ||
          original.restAfter !== stage.restAfter
        );
      })
    );
  }, [plan, name, type, restBetweenStages, stages]);

  function handleCancel() {
    if (isDirty) {
      setConfirmDiscard(true);
    } else {
      onCancel();
    }
  }

  useEffect(() => {
    if (editingIndex === null) {
      setPreviewSrc(null);
      setPreviewType(null);
      return;
    }
    const stage = stages[editingIndex];
    if (!stage?.mediaId) {
      setPreviewSrc(null);
      setPreviewType(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPreview() {
      const media = await mediaService.getMediaById(stage.mediaId!);
      if (cancelled || !media) return;
      objectUrl = URL.createObjectURL(media.blob);
      setPreviewSrc(objectUrl);
      setPreviewType(media.mimeType.startsWith('video') ? 'video' : 'image');
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

  function handleSelectTemplate(template: ExerciseTemplate) {
    const newStage: Stage = {
      id: generateId(),
      planId: plan?.id ?? '',
      order: stages.length,
      name: template.name,
      mediaType: null,
      mediaId: null,
      duration: template.duration,
      reps: template.reps,
      notes: template.notes,
      restAfter: null,
    };
    setStages([...stages, newStage]);
    // Open the editor so the user can fine-tune duration, add media, etc.
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStages((current) => {
      const from = current.findIndex((s) => s.id === active.id);
      const to = current.findIndex((s) => s.id === over.id);
      if (from === -1 || to === -1) return current;
      return arrayMove(current, from, to);
    });
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
      setPreviewType(file.type.startsWith('video') ? 'video' : 'image');
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
          stages: stages.map((stage, order) => ({ ...stage, order })),
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
    <PageLayout>
      <ScreenHeader
        title={plan ? 'Edit Plan' : 'New Plan'}
        onBack={handleCancel}
      />

      <main className="p-4 space-y-5 pb-6">
        {error && (
          <div className="p-3 bg-danger-soft text-danger rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="plan-name" className={labelClass}>
            Plan Name
          </label>
          <input
            id="plan-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Morning HIIT"
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>Workout Type</span>
          <SegmentedControl
            label="Workout type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />
        </div>

        <Slider
          label="Rest Between Stages"
          min={10}
          max={120}
          step={5}
          value={restBetweenStages}
          onChange={setRestBetweenStages}
          formatValue={(v) => `${v}s`}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass + ' mb-0'}>Stages ({stages.length})</span>
            <span className="text-xs text-ink-3">Drag the handle to reorder</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {stages.map((stage, index) => (
                  <StageRow
                    key={stage.id}
                    stage={stage}
                    index={index}
                    onEdit={() => setEditingIndex(index)}
                    onDelete={() => handleDeleteStage(index)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          {stages.length === 0 && (
            <p className="text-sm text-ink-3 py-4 text-center">
              No stages yet — add one below or pick a template.
            </p>
          )}

          <button
            type="button"
            onClick={handleAddStage}
            className="w-full mt-3 min-h-12 border-2 border-dashed border-line rounded-xl flex items-center justify-center gap-2 text-ink-2 font-medium hover:border-brand hover:text-brand transition-colors"
          >
            <Plus size={18} aria-hidden />
            Add New Stage
          </button>

          <button
            type="button"
            onClick={() => setTemplatePickerOpen(true)}
            className="w-full mt-2 min-h-11 inline-flex items-center justify-center gap-1.5 text-sm text-brand font-medium hover:bg-brand-soft rounded-xl transition-colors"
          >
            <Sparkles size={16} aria-hidden />
            Or pick from a template…
          </button>
        </div>
      </main>

      <BottomActionBar>
        <Button size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Plan'}
        </Button>
      </BottomActionBar>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        message="You have unsaved changes to this plan. Leave without saving?"
        confirmLabel="Discard"
        danger
        onConfirm={() => {
          setConfirmDiscard(false);
          onCancel();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />

      <StageEditorModal
        open={editingIndex !== null}
        stage={editingIndex !== null ? stages[editingIndex] : null}
        planType={type}
        onClose={() => setEditingIndex(null)}
        onSave={handleSaveStage}
        onUploadMedia={handleUploadMedia}
        previewSrc={previewSrc}
        previewType={previewType}
        onReplay={handleReplayPreview}
      />

      <TemplatePicker
        open={templatePickerOpen}
        planType={type}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleSelectTemplate}
      />
    </PageLayout>
  );
}
