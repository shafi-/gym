import type { Table } from 'dexie';
import { db } from '../lib/db';

export abstract class BaseRepository<T extends { id: string }> {
  protected table: Table<T, string>;

  constructor(table: Dexie.Table<T, string>) {
    this.table = table;
  }

  async findById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  async findAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async create(entity: T): Promise<T> {
    await this.table.add(entity);
    return entity;
  }

  async update(entity: T): Promise<T> {
    await this.table.put(entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async clear(): Promise<void> {
    await this.table.clear();
  }

  async count(): Promise<number> {
    return this.table.count();
  }
}
