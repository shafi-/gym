import { test, expect, Page } from '@playwright/test';
import type { Plan } from '../../src/models/plan.model';

// Test plan: two short stages so we can exercise transitions quickly.
const TEST_PLAN: Plan = {
  id: 'e2e-plan-1',
  name: 'E2E Test Workout',
  type: 'hiit',
  stages: [
    { id: 'e2e-stage-1', planId: 'e2e-plan-1', order: 0, name: 'Jumping Jacks', mediaType: null, mediaId: null, duration: 6, reps: null, notes: '', restAfter: null },
    { id: 'e2e-stage-2', planId: 'e2e-plan-1', order: 1, name: 'High Knees', mediaType: null, mediaId: null, duration: 6, reps: null, notes: '', restAfter: null },
  ],
  restBetweenStages: 3,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

/**
 * Seed a plan directly into the Dexie/IndexedDB store.
 * The app must be opened once first so Dexie creates the schema/stores.
 */
async function seedPlan(page: Page, plan: Plan): Promise<void> {
  await page.evaluate((value) => {
    const p = value as Plan;
    return new Promise<void>((resolve, reject) => {
      const openReq = indexedDB.open('GymAppDB');
      openReq.onsuccess = () => {
        const conn = openReq.result;
        const tx = conn.transaction(['plans'], 'readwrite');
        const store = tx.objectStore('plans');
        store.add(p);
        tx.commit();
        resolve();
      };
      openReq.onerror = () => reject(openReq.result?.name ?? 'indexedDB open error');
    });
  }, plan);
}

/** Seed + open the home page once so Dexie creates the schema. */
async function seedFreshPlan(page: Page, plan: Plan = TEST_PLAN): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'My Plans' })).toBeVisible();
  await seedPlan(page, plan);
}

async function openSession(page: Page): Promise<void> {
  await seedFreshPlan(page);
  await page.goto(`/session/${TEST_PLAN.id}`);
  // Session route mounts behind a "Ready?" gate whose Start tap doubles as
  // the user gesture browsers require before allowing audio.
  await page.getByRole('button', { name: 'Start' }).click();
  // Session screen shows the stage title + timer.
  await expect(getStageHeading(page, 'Jumping Jacks')).toBeVisible();
}

/** Stage names also appear in voice-announce toasts; match the heading only. */
function getStageHeading(page: Page, name: string) {
  return page.getByRole('heading', { name });
}

test.describe('Session infrastructure', () => {
  test('starts a session and shows the first stage', async ({ page }) => {
    await openSession(page);

    await expect(getStageHeading(page, 'Jumping Jacks')).toBeVisible();
    await expect(page.getByText('Stage 1 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('timer counts down', async ({ page }) => {
    await openSession(page);

    const read = (): Promise<string> =>
      page.locator('span.font-mono').first().innerText();

    const first = (await read()).replace(':', '');
    await page.waitForTimeout(1600);
    const second = (await read()).replace(':', '');
    expect(Number(second)).toBeLessThan(Number(first));
  });

  test('pause freezes the timer and resume resumes it', async ({ page }) => {
    await openSession(page);

    const read = (): Promise<string> =>
      page.locator('span.font-mono').first().innerText();

    const first = (await read()).replace(':', '');

    // Pause.
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.waitForTimeout(1600);
    const paused = (await read()).replace(':', '');
    expect(paused).toBe(first); // timer frozen

    // Resume.
    await page.getByRole('button', { name: 'Resume' }).click();
    await page.waitForTimeout(1600);
    const resumed = (await read()).replace(':', '');
    expect(Number(resumed)).toBeLessThan(Number(paused));
  });

  test('skip next advances to the following stage', async ({ page }) => {
    await openSession(page);

    await getStageHeading(page, 'Jumping Jacks').waitFor();
    await page.getByRole('button', { name: 'Next stage' }).click();

    await expect(getStageHeading(page, 'High Knees')).toBeVisible();
    await expect(page.getByText('Stage 2 of 2')).toBeVisible();
  });

  test('completes a full session', async ({ page }) => {
    await openSession(page);

    // Skip through to complete quickly.
    await page.getByRole('button', { name: 'Next stage' }).click();
    await page.getByRole('button', { name: 'Next stage' }).click();

    await expect(page.getByText('Session Complete!')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  test('cancel returns to the plan', async ({ page }) => {
    await openSession(page);

    await page.getByRole('button', { name: 'Cancel Session' }).click();
    // Cancel navigates back to the plan detail page.
    await expect(page.getByText('E2E Test Workout')).toBeVisible();
  });

  test('warm navigation from plan detail skips the Ready gate', async ({ page }) => {
    await seedFreshPlan(page);

    // Warm path: land on plan detail, start from its Start Session button.
    await page.goto(`/plan/${TEST_PLAN.id}`);
    await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible();
    await page.getByRole('button', { name: 'Start Session' }).click();

    // Gate must NOT appear; the first stage should be live already.
    await expect(page.getByRole('button', { name: 'Start', exact: true })).toHaveCount(0);
    await expect(getStageHeading(page, 'Jumping Jacks')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('cold entry to session route shows the Ready gate', async ({ page }) => {
    await seedFreshPlan(page);

    // Gesture-less entry: no navigation through plan detail first.
    await page.goto(`/session/${TEST_PLAN.id}`);

    // Gate is up, session not started yet — timer must not be running.
    await expect(page.getByRole('heading', { name: 'Ready?' })).toBeVisible();
    await expect(getStageHeading(page, 'Jumping Jacks')).toHaveCount(0);
  });
});