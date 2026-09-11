import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { PlanCard } from '../../components/plan/PlanCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
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
        <p className="text-danger mb-4">{error}</p>
        <button
          onClick={loadPlans}
          className="inline-flex items-center gap-2 min-h-11 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-500 transition-colors"
        >
          <RefreshCw size={16} aria-hidden />
          Retry
        </button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="No plans yet"
        message="Create your first workout plan and start training!"
        action={{ label: 'Create Plan', onClick: onCreatePlan }}
      />
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
