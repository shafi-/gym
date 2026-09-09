import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    viewport: { width: 390, height: 844 }, // mobile-first PWA
    trace: 'retain-on-failure',
    locale: 'en-US',
    // Use the system-installed Google Chrome exclusively. Override with
    // PLAYWRIGHT_CHROME_PATH if Chrome lives elsewhere on your machine.
    launchOptions: {
      channel: 'chrome',
    },
  },
  // Run only against Google Chrome, not bundled Chromium.
  projects: [{ name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } }],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});