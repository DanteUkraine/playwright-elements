import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  projects: [
    {
      name: 'Types tests',
      testMatch: 'types/**/*.spec.ts'
    },
    {
      name: 'Browser tests',
      testMatch: 'browser*.spec.playwright.ts'
    },
    {
      name: 'Core tests',
      testMatch: ['page.object.builder*.spec.playwright.ts', 'test.support.spec.playwright.ts', 'testIds.spec.playwright.ts']
    },
    {
      name: 'CLI Generator tests',
      testMatch: 'index.generator*.spec.playwright.ts',
      timeout: 90_000,
      fullyParallel: false
    },
    {
      name: 'Web Element Edge Cases',
      testMatch: 'web.element.edge.cases.spec.playwright.ts',
      timeout: 45_000,
    },
    {
      name: 'Web Element tests',
      testMatch: ['web.element.build.in.selectors.spec.playwright.ts', 'web.element.concurrency.spec.playwright.ts', 'web.element.errors.spec.playwright.ts', 'web.element.missing.methods.spec.playwright.ts', 'web.element.page.and.frame.pointers.spec.playwright.ts', 'web.element.sub.elements.additional.methods.spec.playwright.ts']
    },
    {
      name: 'Test suite tests',
      testMatch: ['*(performance|memory|stress).tests.spec.playwright.ts', 'performance.benchmarks.spec.playwright.ts'],
      timeout: 45_000
    },
    {
      name: 'Subdirectory tests',
      testMatch: /(regression|collisions)\/.*\.spec\.playwright\.ts/
    },
    {
      name: 'Input validation tests',
      testMatch: ['input.validation.spec.playwright.ts']
    },
    {
      name: 'CSS Edge Cases tests',
      testMatch: 'selectors/css.edge.cases.spec.playwright.ts',
      timeout: 45_000,
    },
    {
      name: 'Security contracts tests',
      testMatch: 'security.contracts.spec.playwright.ts',
      use: {
        actionTimeout: 15_000,
      }
    },
  ],
  testDir: './test',
  testIgnore: 'integration.tests/**',
  fullyParallel: true,
  retries: 1,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    trace: 'retain-on-failure',
  },
});
