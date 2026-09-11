import { test as baseTest, Page } from '@playwright/test';
import { test as coreTest, expect, WebElement } from '../src';

export const test = coreTest.extend<{
    testPage: Page
}>({
    testPage: [
        async ({ page }, use: (testPage: Page) => Promise<void>) => {
            await page.setContent('<html><body><h1>Test</h1><div id="test"></div><input type="text" id="input"></input></body></html>');
            await use(page);
        },
        { scope: 'test' }
    ]
});

export { expect, WebElement };
