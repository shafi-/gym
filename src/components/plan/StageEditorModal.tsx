import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MediaUploader } from './MediaUploader';
import { inputClass, labelClass } from '../ui/InputStyles';
import type { Stage, WorkoutType } from '../../models/plan.model';

interface StageEditorModalProps {
  open: boolean;
  stage: Stage | null;
  planType: WorkoutType;
  onClose: () => void;
  onSave: (updates: Partial<Stage>) => void;
  onUploadMedia: (file: File) => void;
  previewSrc?: string | null;
  previewType?: 'image' | 'video' | null;
  onReplay?: () => void;
}

export function StageEditorModal({
  open,
  stage,
  planType,
  onClose,
  onSave,
  onUploadMedia,
  previewSrc,
  previewType,
  onReplay,
}: StageEditorModalProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [reps, setReps] = useState(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (stage) {
      setName(stage.name);
      setDuration(stage.duration ?? 30);
      setReps(stage.reps ?? 10);
      setNotes(stage.notes ?? '');
    }
  }, [stage]);

  if (!open || !stage) return null;

  const isStrength = planType === 'strength';
  const durationLabel = isStrength ? 'Rest after set (seconds)' : 'Duration (seconds)';

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      duration: isStrength ? null : duration,
      reps: isStrength ? reps : null,
      notes: notes.trim(),
    });
    onClose();
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit Stage">
      <div className="space-y-4">
        <div>
          <label htmlFor="stage-name" className={labelClass}>
            Stage Name
          </label>
          <input
            id="stage-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jumping Jacks"
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="stage-duration" className={labelClass}>
            {durationLabel}
          </label>
          <input
            id="stage-duration"
            type="number"
            min="1"
            max="600"
            value={isStrength ? 0 : duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={isStrength}
            className={`${inputClass} disabled:bg-surface-2 disabled:text-ink-3`}
          />
        </div>

        {isStrength && (
          <div>
            <label htmlFor="stage-reps" className={labelClass}>
              Reps per set
            </label>
            <input
              id="stage-reps"
              type="number"
              min={1}
              max={100}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <span className={labelClass}>Demonstration</span>
          <MediaUploader
            onFileSelect={onUploadMedia}
            currentPreview={previewSrc}
            currentMediaType={previewType}
            onReplay={onReplay}
          />
        </div>

        <div>
          <label htmlFor="stage-notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="stage-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Form cues, tips, etc."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          Save Stage
        </Button>
      </div>
    </Modal>
  );
}
