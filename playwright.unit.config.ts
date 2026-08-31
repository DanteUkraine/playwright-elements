import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        screenshot: 'only-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 30000,
      },
    },
  ],
  testDir: './test',
  testMatch: '**/*.spec.playwright.ts',
  testIgnore: '**/integration.tests/**',
  fullyParallel: false,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    trace: 'retain-on-failure',
  },
});
