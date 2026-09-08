import { PlanListContainer } from '../../containers/home/PlanListContainer';
import { PageLayout } from '../../components/ui/PageLayout';

interface HomePageProps {
  onSelectPlan: (id: string) => void;
  onCreatePlan: () => void;
  onImport: () => void;
}

export function HomePage({ onSelectPlan, onCreatePlan, onImport }: HomePageProps) {
  return (
    <PageLayout>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Gym App</h1>
        <button
          onClick={onImport}
          className="text-sm text-primary-600 font-medium"
        >
          Import
        </button>
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
