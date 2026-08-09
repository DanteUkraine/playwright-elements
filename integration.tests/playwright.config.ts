import { devices, PlaywrightTestConfig } from '@playwright/test';
import { generateIndexFile } from '../src/index';

generateIndexFile('./integration.tests/resources');

const config: PlaywrightTestConfig = {
    timeout: 45_000,
    expect: {
        timeout: 15_000
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    use: {
        headless: true,
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://playwright.dev',
        ignoreHTTPSErrors: true,
        // Enable diagnostics collection
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    // Configure test reporting
    reporter: [
        ['list'],
        ['json', { outputFile: 'test-results/integration-results.json' }],
        ['junit', { outputFile: 'test-results/integration-results.xml' }],
        ['html', { outputFolder: 'test-results/integration-html-report' }]
    ],
};
export default config;
