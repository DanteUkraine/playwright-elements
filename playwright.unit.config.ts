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
  
  // Test directories for unit tests
  testDir: './test',
  // Match both migrated playwright tests and keep mocha tests for now
  testMatch: '**/*.spec.playwright.ts',
  testIgnore: '**/integration.tests/**',
  
  // Run tests sequentially (matches mocha parallel: false)
  fullyParallel: false,
  workers: 1,
  
  // Timeout settings (matches mocha timeout)
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  // Reporter
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  
  // Global setup
  globalSetup: './test/playwright.global-setup.ts',
  globalTeardown: './test/playwright.global-teardown.ts',
  
  // Build and cache
  use: {
    trace: 'retain-on-failure',
  },
});
