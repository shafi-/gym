import { PlanListContainer } from '../../containers/home/PlanListContainer';
import { PageLayout } from '../../components/ui/PageLayout';

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
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Pulse</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onHistory}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={onSettings}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={onImport}
            className="text-sm text-primary-600 font-medium px-2 py-1"
          >
            Import
          </button>
        </div>
      </header>

      <main className="p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">My Plans</h2>
        <PlanListContainer
          onSelectPlan={onSelectPlan}
          onCreatePlan={onCreatePlan}
        />
      </main>

      <button
        onClick={onCreatePlan}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-700 transition-colors"
      >
        +
      </button>
    </PageLayout>
  );
}
