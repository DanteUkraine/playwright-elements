import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 45_000,
    expect: {
        timeout: 15_000
    },
    webServer: {
        command: 'npx http-server integration.tests/server -p 3457 -s',
        port: 3457,
        timeout: 90_000,
        reuseExistingServer: true,
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
        baseURL: 'http://localhost:3457',
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
    ],
};
export default config;
