import { defineConfig, devices } from '@playwright/test';

// Unit test configuration for playwright-elements
// Uses chromium for fast unit tests
// Integration tests should use playwright.config.ts in integration.tests/

export default defineConfig({
  // Run tests in single browser for unit tests
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Unit tests don't need full browser, use headless
        headless: true,
        // Disable video and screenshots for unit tests
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Increase timeout for browser operations
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
  
  globalSetup: './test/playwright.global-setup.ts',
  globalTeardown: './test/playwright.global-teardown.ts',
  
  use: {
    trace: 'retain-on-failure',
  },
});
