import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Path to saved auth storage state (gitignored)
export const STORAGE_STATE = path.join(__dirname, 'e2e', '.auth', 'user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid DB race conditions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 60_000, // 60s per test (login + Redux dispatches take time)

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  projects: [
    // 1. Global setup: login once and save auth state
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    // 2. Unauthenticated tests (auth page only)
    {
      name: 'auth-tests',
      testMatch: /auth\.spec\.ts/,
    },
    // 3. Authenticated tests — depend on setup completing first
    {
      name: 'authenticated',
      testMatch: /^(?!.*auth\.spec\.ts).*\.spec\.ts$/,
      dependencies: ['setup'],
      use: {
        storageState: STORAGE_STATE,
      },
    },
  ],

  // Auto-start the dev-server if not running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
