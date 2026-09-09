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
  testMatch: [
    '**/*.{tests,benchmarks}.spec.playwright.ts',
    'test/browser*.spec.playwright.ts',
    'test/index.generator*.spec.playwright.ts',
    'test/page.object.builder*.spec.playwright.ts',
    'test/testIds.spec.playwright.ts',
    'test/test.support.spec.playwright.ts',
    'test/web.element*.spec.playwright.ts',
  ],
  testIgnore: '**/integration.tests/**',
  fullyParallel: false,
  timeout: 60000,
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
