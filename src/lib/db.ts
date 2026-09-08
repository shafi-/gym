import Dexie, { Table } from 'dexie';
import type { Plan } from '../models/plan.model';
import type { MediaRecord } from '../models/media.model';
import type { SessionHistory } from '../models/history.model';

export class GymDatabase extends Dexie {
  plans!: Table<Plan, string>;
  media!: Table<MediaRecord, string>;
  history!: Table<SessionHistory, string>;

  constructor() {
    super('GymAppDB');
    this.version(1).stores({
      plans: 'id, name, type, createdAt, updatedAt',
      media: 'id, mimeType, size',
      history: 'id, planId, startedAt, completedAt',
    });
  }
}

export const db = new GymDatabase();
