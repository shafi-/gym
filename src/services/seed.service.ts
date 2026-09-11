import { db } from '../lib/db';
import { createStarterPlans } from '../data/starter-plans';

const SEED_FLAG_KEY = 'starterPlansSeeded';

/**
 * Registers one-time seeding of the bundled starter plans via Dexie's
 * `ready` hook, so it runs after the DB opens but before any query
 * (e.g. the home screen plan list) reads from it.
 */
export function registerStarterPlanSeeding(): void {
  db.on('ready', async () => {
    try {
      const flag = await db.meta.get(SEED_FLAG_KEY);
      if (flag) return;
      await db.plans.bulkPut(createStarterPlans());
      await db.meta.put({ key: SEED_FLAG_KEY, value: new Date().toISOString() });
    } catch (err) {
      // Never block the app on seeding; the user can still create plans.
      console.error('Failed to seed starter plans:', err);
    }
  });
}
