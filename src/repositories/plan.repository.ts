import type { Plan, WorkoutType } from '../models/plan.model';
import { BaseRepository } from './base.repository';
import { db } from '../lib/db';

export class PlanRepository extends BaseRepository<Plan> {
  constructor() {
    super(db.plans);
  }

  async findByType(type: WorkoutType): Promise<Plan[]> {
    return db.plans.where('type').equals(type).toArray();
  }

  async findRecent(limit: number): Promise<Plan[]> {
    return db.plans.orderBy('updatedAt').reverse().limit(limit).toArray();
  }

  async searchByName(query: string): Promise<Plan[]> {
    const all = await this.findAll();
    return all.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
