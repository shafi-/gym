import type { MediaRecord } from '../models/media.model';
import { BaseRepository } from './base.repository';
import { db } from '../lib/db';

export class MediaRepository extends BaseRepository<MediaRecord> {
  constructor() {
    super(db.media);
  }

  async getTotalSize(): Promise<number> {
    const all = await this.findAll();
    return all.reduce((sum, record) => sum + record.size, 0);
  }
}
