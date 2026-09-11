import Dexie, { Table } from 'dexie';
import type { Plan } from '../models/plan.model';
import type { MediaRecord } from '../models/media.model';
import type { SessionHistory } from '../models/history.model';

export interface MetaRecord {
  key: string;
  value: string;
}

export class GymDatabase extends Dexie {
  plans!: Table<Plan, string>;
  media!: Table<MediaRecord, string>;
  history!: Table<SessionHistory, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('GymAppDB');
    this.version(1).stores({
      plans: 'id, name, type, createdAt, updatedAt',
      media: 'id, mimeType, size',
      history: 'id, planId, startedAt, completedAt',
    });
    this.version(2).stores({
      meta: 'key',
    });
  }
}

export const db = new GymDatabase();
