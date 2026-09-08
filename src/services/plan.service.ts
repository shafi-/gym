import type { Plan, CreatePlanDTO } from '../models/plan.model';
import { PlanRepository } from '../repositories/plan.repository';
import { MediaRepository } from '../repositories/media.repository';

export class PlanService {
  private planRepo = new PlanRepository();
  private mediaRepo = new MediaRepository();

  async getAllPlans(): Promise<Plan[]> {
    return this.planRepo.findAll();
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    return this.planRepo.findById(id);
  }

  async createPlan(data: CreatePlanDTO): Promise<Plan> {
    const now = Date.now();
    const plan: Plan = {
      id: crypto.randomUUID(),
      name: data.name,
      type: data.type,
      stages: data.stages.map((stage, index) => ({
        ...stage,
        id: crypto.randomUUID(),
        planId: '', // Will be set below
        order: index,
      })),
      restBetweenStages: data.restBetweenStages ?? 30,
      createdAt: now,
      updatedAt: now,
    };

    // Set planId on all stages
    plan.stages = plan.stages.map((stage) => ({
      ...stage,
      planId: plan.id,
    }));

    return this.planRepo.create(plan);
  }

  async updatePlan(plan: Plan): Promise<Plan> {
    const updated: Plan = {
      ...plan,
      updatedAt: Date.now(),
    };
    return this.planRepo.update(updated);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.planRepo.findById(id);
    if (!plan) return;

    // Cascade delete: remove associated media
    for (const stage of plan.stages) {
      if (stage.mediaId) {
        await this.mediaRepo.delete(stage.mediaId);
      }
    }
    await this.planRepo.delete(id);
  }

  async duplicatePlan(id: string): Promise<Plan> {
    const original = await this.planRepo.findById(id);
    if (!original) throw new Error('Plan not found');

    const now = Date.now();
    const clone: Plan = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      stages: original.stages.map((stage) => ({
        ...stage,
        id: crypto.randomUUID(),
      })),
      createdAt: now,
      updatedAt: now,
    };
    return this.planRepo.create(clone);
  }

  getEstimatedDuration(plan: Plan): number {
    const stagesDuration = plan.stages.reduce(
      (sum, stage) => sum + (stage.duration ?? 0),
      0
    );
    const restDuration = (plan.stages.length - 1) * plan.restBetweenStages;
    return stagesDuration + restDuration;
  }
}
