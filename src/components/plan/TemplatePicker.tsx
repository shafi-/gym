import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { EXERCISE_TEMPLATES, TEMPLATE_GROUPS, type ExerciseTemplate } from '../../data/templates.ts';
import type { WorkoutType } from '../../models/plan.model';

interface TemplatePickerProps {
  open: boolean;
  planType: WorkoutType;
  onClose: () => void;
  onSelect: (template: ExerciseTemplate) => void;
}

export function TemplatePicker({ open, planType, onClose, onSelect }: TemplatePickerProps) {
  const [activeType, setActiveType] = useState<WorkoutType>(planType);

  const filtered = EXERCISE_TEMPLATES.filter((t) => t.type === activeType);

  function handleSelect(template: ExerciseTemplate) {
    onSelect(template);
    onClose();
  }

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Exercise from Template</h2>

        {/* Type tabs */}
        <div className="flex gap-2 mb-4">
          {TEMPLATE_GROUPS.map((group) => (
            <button
              key={group.type}
              onClick={() => setActiveType(group.type)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeType === group.type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {group.emoji} {group.label}
            </button>
          ))}
        </div>

        {/* Template list */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{template.name}</span>
                <span className="text-sm text-gray-500">
                  {template.duration ? `${template.duration}s` : template.reps ? `${template.reps} reps` : ''}
                </span>
              </div>
              {template.notes && (
                <p className="text-xs text-gray-500 mt-1">{template.notes}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}