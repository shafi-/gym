import { useEffect, useState } from 'react';
import { PlanCard } from '../../components/plan/PlanCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PlanService } from '../../services/plan.service';
import type { Plan } from '../../models/plan.model';
import { Spinner } from '../../components/ui/Spinner';

const planService = new PlanService();

interface PlanListContainerProps {
  onSelectPlan: (id: string) => void;
  onCreatePlan: () => void;
}

export function PlanListContainer({ onSelectPlan, onCreatePlan }: PlanListContainerProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setError(null);
      const data = await planService.getAllPlans();
      setPlans(data.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      setError('Failed to load plans. Please try again.');
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await planService.deletePlan(pendingDeleteId);
      await loadPlans();
    } catch (err) {
      setError('Failed to delete plan. Please try again.');
      console.error('Failed to delete plan:', err);
    } finally {
      setPendingDeleteId(null);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await planService.duplicatePlan(id);
      await loadPlans();
    } catch (err) {
      setError('Failed to duplicate plan. Please try again.');
      console.error('Failed to duplicate plan:', err);
    }
  }

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadPlans}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No plans yet. Create your first workout plan!</p>
        <button
          onClick={onCreatePlan}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          + Create Plan
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={() => onSelectPlan(plan.id)}
            onDelete={() => setPendingDeleteId(plan.id)}
            onDuplicate={() => handleDuplicate(plan.id)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This will also remove its media."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
