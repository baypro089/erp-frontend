import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'line',

  use: {
    baseURL: 'http://localhost:4000',
    viewport: { width: 1920, height: 1080 },
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
});
