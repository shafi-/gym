import type { SessionHistory } from '../models/history.model';
import { BaseRepository } from './base.repository';
import { db } from '../lib/db';

export class HistoryRepository extends BaseRepository<SessionHistory> {
  constructor() {
    super(db.history);
  }

  async findRecent(limit: number): Promise<SessionHistory[]> {
    return db.history.orderBy('completedAt').reverse().limit(limit).toArray();
  }

  async findByPlanId(planId: string): Promise<SessionHistory[]> {
    return db.history.where('planId').equals(planId).toArray();
  }
}
