import type { SessionHistory } from '../models/history.model';
import { HistoryRepository } from '../repositories/history.repository';

export class HistoryService {
  private historyRepo = new HistoryRepository();

  async getAllHistory(): Promise<SessionHistory[]> {
    return this.historyRepo.findAll();
  }

  async getRecentHistory(limit: number): Promise<SessionHistory[]> {
    return this.historyRepo.findRecent(limit);
  }

  async logSession(data: Omit<SessionHistory, 'id'>): Promise<SessionHistory> {
    const entry: SessionHistory = {
      ...data,
      id: crypto.randomUUID(),
    };
    return this.historyRepo.create(entry);
  }

  async deleteEntry(id: string): Promise<void> {
    await this.historyRepo.delete(id);
  }

  async clearAll(): Promise<void> {
    await this.historyRepo.clear();
  }

  async getHistoryByPlan(planId: string): Promise<SessionHistory[]> {
    return this.historyRepo.findByPlanId(planId);
  }
}
