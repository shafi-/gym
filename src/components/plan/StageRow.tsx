import type { Stage } from '../../models/plan.model';

interface StageRowProps {
  stage: Stage;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function StageRow({ stage, index, onEdit, onDelete }: StageRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onEdit}
    >
      <span className="text-gray-400 cursor-grab">☰</span>
      <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
        {index + 1}
      </span>
      <div className="flex-1">
        <span className="font-medium text-gray-800">{stage.name}</span>
        <span className="text-sm text-gray-500 ml-2">
          {stage.duration ? `${stage.duration}s` : stage.reps ? `${stage.reps} reps` : ''}
        </span>
      </div>
      {stage.mediaId && <span className="text-sm">📷</span>}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-gray-400 hover:text-red-500"
      >
        ✕
      </button>
    </div>
  );
}
