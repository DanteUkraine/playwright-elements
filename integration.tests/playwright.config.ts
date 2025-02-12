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
        baseURL: 'https://playwright.dev',
        ignoreHTTPSErrors: true,
    },
};
export default config;
