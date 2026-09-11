import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Chip } from '../ui/Chip';
import { inputClass } from '../ui/InputStyles';
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
    <Modal isOpen={open} onClose={onClose} title="Add Exercise">
      {/* Type tabs */}
      <div className="flex gap-2 mb-3">
        {TEMPLATE_GROUPS.map((group) => (
          <button
            key={group.type}
            type="button"
            aria-pressed={activeType === group.type}
            onClick={() => handleTypeSwitch(group.type)}
            className={`flex-1 min-h-10 px-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === group.type
                ? 'bg-primary-600 text-white'
                : 'bg-surface-2 text-ink-2 hover:bg-line hover:text-ink'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          aria-label="Search exercises"
          className={`${inputClass} pl-10`}
        />
      </div>

      {/* Muscle group filters */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {groupOptions.map((group) => (
          <Chip
            key={group}
            selected={selectedGroups.includes(group)}
            onClick={() => setSelectedGroups(toggle(selectedGroups, group))}
          >
            {MUSCLE_GROUP_LABELS[group]}
          </Chip>
        ))}
      </div>

      {/* Difficulty + equipment filters */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {DIFFICULTY_ORDER.map((difficulty) => (
          <Chip
            key={difficulty}
            selected={selectedDifficulties.includes(difficulty)}
            onClick={() => setSelectedDifficulties(toggle(selectedDifficulties, difficulty))}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </Chip>
        ))}
        <Chip selected={bodyweightOnly} onClick={() => setBodyweightOnly(!bodyweightOnly)}>
          No equipment
        </Chip>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-ink-3 tabular" aria-live="polite">
          {filtered.length} exercise{filtered.length === 1 ? '' : 's'}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-brand font-medium hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Template list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
        {filtered.map((template) => {
          const needsEquipment = template.equipment.some((e) => !BODYWEIGHT_EQUIPMENT.includes(e));
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className="w-full text-left p-3 bg-surface-2 rounded-xl hover:bg-brand-soft border border-transparent transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-ink">{template.name}</span>
                <span className="text-sm text-ink-2 tabular shrink-0">
                  {template.duration ? `${template.duration}s` : template.reps ? `${template.reps} reps` : ''}
                </span>
              </div>
              <p className="text-xs text-ink-3 mt-0.5">
                {DIFFICULTY_LABELS[template.difficulty]} ·{' '}
                {template.muscleGroups.map((g) => MUSCLE_GROUP_LABELS[g]).join(', ')}
                {needsEquipment &&
                  ` · ${template.equipment
                    .filter((e) => !BODYWEIGHT_EQUIPMENT.includes(e))
                    .map((e) => EQUIPMENT_LABELS[e])
                    .join(', ')}`}
              </p>
              {template.notes && (
                <p className="text-xs text-ink-3 mt-1">{template.notes}</p>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-ink-2 mb-2">No exercises match your filters.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-brand font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
