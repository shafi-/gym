import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, Film, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { Stage } from '../../models/plan.model';
import { IconButton } from '../ui/IconButton';

interface StageRowProps {
  stage: Stage;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

/** Sortable stage row (drag handle + click-to-edit + delete). */
export function StageRow({ stage, index, onEdit, onDelete }: StageRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.id });

  const MediaIcon = stage.mediaType === 'video' ? Film : ImageIcon;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
      className={`flex items-center gap-1 bg-surface-2 rounded-xl ${
        isDragging ? 'opacity-60 shadow-lift relative z-10' : ''
      }`}
    >
      <button
        type="button"
        aria-label={`Reorder ${stage.name}`}
        {...attributes}
        {...listeners}
        className="w-9 h-11 flex items-center justify-center text-ink-3 hover:text-ink-2 touch-none cursor-grab active:cursor-grabbing shrink-0"
      >
        <GripVertical size={18} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 min-w-0 flex items-center gap-3 py-3 pr-1 text-left"
      >
        <span className="w-6 h-6 flex items-center justify-center bg-brand-soft text-brand rounded-full text-xs font-semibold shrink-0 tabular">
          {index + 1}
        </span>
        <span className="flex-1 min-w-0 font-medium text-ink truncate">{stage.name}</span>
        <span className="text-sm text-ink-2 shrink-0 tabular">
          {stage.duration ? `${stage.duration}s` : stage.reps ? `${stage.reps} reps` : ''}
        </span>
        {stage.mediaId && <MediaIcon size={16} className="text-ink-3 shrink-0" aria-label="Has media" />}
      </button>
      <IconButton
        label={`Delete ${stage.name}`}
        variant="danger"
        onClick={() => onDelete()}
        className="w-10 h-10 mr-1"
      >
        <Trash2 size={16} />
      </IconButton>
    </li>
  );
}
