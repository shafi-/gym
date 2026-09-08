import { useEffect, useState } from 'react';
import { PlanCard } from '../../components/plan/PlanCard';
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

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    const data = await planService.getAllPlans();
    setPlans(data.sort((a, b) => b.updatedAt - a.updatedAt));
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this plan?')) {
      await planService.deletePlan(id);
      await loadPlans();
    }
  }

  async function handleDuplicate(id: string) {
    await planService.duplicatePlan(id);
    await loadPlans();
  }

  if (loading) return <Spinner />;

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
    <div>
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSelect={() => onSelectPlan(plan.id)}
          onDelete={() => handleDelete(plan.id)}
          onDuplicate={() => handleDuplicate(plan.id)}
        />
      ))}
    </div>
  );
}
