import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-14 px-6 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 bg-brand-soft rounded-full flex items-center justify-center">
        <Icon size={28} className="text-brand" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      {message && <p className="text-sm text-ink-2 mb-6 max-w-[260px] mx-auto">{message}</p>}
      {action && (
        <Button onClick={action.onClick} className="mx-auto">
          {action.label}
        </Button>
      )}
    </div>
  );
}
