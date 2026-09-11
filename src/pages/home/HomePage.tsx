import { History, Plus, Settings, Upload } from 'lucide-react';
import { PlanListContainer } from '../../containers/home/PlanListContainer';
import { PageLayout } from '../../components/ui/PageLayout';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { IconButton } from '../../components/ui/IconButton';

export interface HomePageProps {
  onSelectPlan: (id: string) => void;
  onCreatePlan: () => void;
  onImport: () => void;
  onHistory: () => void;
  onSettings: () => void;
}

export function HomePage({ onSelectPlan, onCreatePlan, onImport, onHistory, onSettings }: HomePageProps) {
  return (
    <PageLayout>
      <ScreenHeader
        variant="brand"
        title="Pulse"
        actions={
          <>
            <IconButton
              label="History"
              onClick={onHistory}
              className="text-white/80 hover:text-white hover:bg-white/15"
            >
              <History size={20} />
            </IconButton>
            <IconButton
              label="Settings"
              onClick={onSettings}
              className="text-white/80 hover:text-white hover:bg-white/15"
            >
              <Settings size={20} />
            </IconButton>
            <button
              type="button"
              onClick={onImport}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 mr-1 text-sm font-medium text-brand-ink bg-white/15 rounded-full hover:bg-white/25 transition-colors"
            >
              <Upload size={16} aria-hidden />
              Import
            </button>
          </>
        }
      />

      <main className="p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-3 mb-3">My Plans</h2>
        <PlanListContainer
          onSelectPlan={onSelectPlan}
          onCreatePlan={onCreatePlan}
        />
      </main>

      <button
        type="button"
        aria-label="Create plan"
        onClick={onCreatePlan}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lift flex items-center justify-center hover:bg-primary-500 transition-all active:scale-95"
      >
        <Plus size={28} aria-hidden />
      </button>
    </PageLayout>
  );
}
