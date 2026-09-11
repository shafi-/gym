import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import {
  EXERCISE_TEMPLATES,
  TEMPLATE_GROUPS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUP_ORDER,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  EQUIPMENT_LABELS,
  BODYWEIGHT_EQUIPMENT,
  type ExerciseTemplate,
  type MuscleGroup,
  type Difficulty,
} from '../../data/templates.ts';
import type { WorkoutType } from '../../models/plan.model';

interface TemplatePickerProps {
  open: boolean;
  planType: WorkoutType;
  onClose: () => void;
  onSelect: (template: ExerciseTemplate) => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function TemplatePicker({ open, planType, onClose, onSelect }: TemplatePickerProps) {
  const [activeType, setActiveType] = useState<WorkoutType>(planType);
  const [search, setSearch] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [bodyweightOnly, setBodyweightOnly] = useState(false);

  const groupOptions = useMemo(() => {
    const present = new Set<MuscleGroup>();
    for (const t of EXERCISE_TEMPLATES) {
      if (t.type === activeType) t.muscleGroups.forEach((g) => present.add(g));
    }
    return MUSCLE_GROUP_ORDER.filter((g) => present.has(g));
  }, [activeType]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXERCISE_TEMPLATES.filter((t) => {
      if (t.type !== activeType) return false;
      if (q && !`${t.name} ${t.notes}`.toLowerCase().includes(q)) return false;
      if (selectedGroups.length > 0 && !selectedGroups.some((g) => t.muscleGroups.includes(g))) return false;
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(t.difficulty)) return false;
      if (bodyweightOnly && t.equipment.some((e) => !BODYWEIGHT_EQUIPMENT.includes(e))) return false;
      return true;
    });
  }, [activeType, search, selectedGroups, selectedDifficulties, bodyweightOnly]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedGroups.length > 0 ||
    selectedDifficulties.length > 0 ||
    bodyweightOnly;

  function clearFilters() {
    setSearch('');
    setSelectedGroups([]);
    setSelectedDifficulties([]);
    setBodyweightOnly(false);
  }

  function handleTypeSwitch(type: WorkoutType) {
    setActiveType(type);
    setSelectedGroups([]);
  }

  function handleSelect(template: ExerciseTemplate) {
    onSelect(template);
    onClose();
  }

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Exercise from Template</h2>

        {/* Type tabs */}
        <div className="flex gap-2 mb-3">
          {TEMPLATE_GROUPS.map((group) => (
            <button
              key={group.type}
              onClick={() => handleTypeSwitch(group.type)}
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

        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full px-3 py-2 mb-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        {/* Muscle group filters */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {groupOptions.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroups(toggle(selectedGroups, group))}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedGroups.includes(group)
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
              }`}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>

        {/* Difficulty + equipment filters */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {DIFFICULTY_ORDER.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulties(toggle(selectedDifficulties, difficulty))}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedDifficulties.includes(difficulty)
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
              }`}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </button>
          ))}
          <button
            onClick={() => setBodyweightOnly(!bodyweightOnly)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              bodyweightOnly
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
            }`}
          >
            No equipment
          </button>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">
            {filtered.length} exercise{filtered.length === 1 ? '' : 's'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Template list */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filtered.map((template) => {
            const needsEquipment = template.equipment.some((e) => !BODYWEIGHT_EQUIPMENT.includes(e));
            return (
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
                <p className="text-xs text-gray-500 mt-0.5">
                  {DIFFICULTY_LABELS[template.difficulty]} ·{' '}
                  {template.muscleGroups.map((g) => MUSCLE_GROUP_LABELS[g]).join(', ')}
                  {needsEquipment &&
                    ` · ${template.equipment
                      .filter((e) => !BODYWEIGHT_EQUIPMENT.includes(e))
                      .map((e) => EQUIPMENT_LABELS[e])
                      .join(', ')}`}
                </p>
                {template.notes && (
                  <p className="text-xs text-gray-500 mt-1">{template.notes}</p>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-2">No exercises match your filters.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
