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
    '**/*.spec.playwright.ts',
    'test/types/*.spec.ts',
  ],
  testIgnore: [
    '**/integration.tests/**',
    '**/*.{tests,benchmarks}.spec.playwright.ts',
    'test/browser*.spec.playwright.ts',
    'test/index.generator*.spec.playwright.ts',
    'test/page.object.builder*.spec.playwright.ts',
    'test/testIds.spec.playwright.ts',
    'test/test.support.spec.playwright.ts',
    'test/web.element*.spec.playwright.ts',
    'test/memory.tests.spec.playwright.ts',
    'test/performance.benchmarks.spec.playwright.ts',
  ],
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
