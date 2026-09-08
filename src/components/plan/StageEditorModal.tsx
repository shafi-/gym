import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MediaUploader } from './MediaUploader';
import type { Stage, WorkoutType } from '../../models/plan.model';

interface StageEditorModalProps {
  open: boolean;
  stage: Stage | null;
  planType: WorkoutType;
  onClose: () => void;
  onSave: (updates: Partial<Stage>) => void;
  onUploadMedia: (file: File) => void;
  previewSrc?: string | null;
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
    <Modal isOpen={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Stage</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jumping Jacks"
              autoFocus
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {durationLabel}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="600"
                value={isStrength ? 0 : duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isStrength}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
              {isStrength && (
                <span className="text-sm text-gray-500">seconds</span>
              )}
            </div>
          </div>

          {isStrength && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reps per set
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demonstration
            </label>
            <MediaUploader
              onFileSelect={onUploadMedia}
              currentPreview={previewSrc}
              onReplay={onReplay}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Form cues, tips, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
      </div>
    </Modal>
  );
}