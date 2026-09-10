import { test as base, Page, Response, expect, BrowserContext } from '@playwright/test';
import type { Locator } from 'playwright-core';
import type { Expect } from '@playwright/test';
import { BrowserInstance, usePage } from './browser';
import { WebElement } from './web.element';

WebElement.setExpectProvider({
    expect: expect,
    softExpect: expect.soft
});

// Type augmentation: When using playwright-elements/test, the expect() and softExpect()
// methods should return Playwright's full LocatorExpect type
declare module './web.element' {
    interface WebElementAssertions {
        expect: ReturnType<Expect<Locator>>;
        softExpect: ReturnType<Expect<Locator>>;
    }
}

type GoToOptions = {
    referer?: string | undefined,
    timeout?: number | undefined,
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' | undefined
};

export const test = base.extend<{
    goto: (endpoint?: string, options?: GoToOptions) => Promise<null | Response>,
    initBrowserInstance: void,
    usePage: <T>(page: Page, callback: () => Promise<T>) => Promise<T>,
    testPage: Page
}>({
    goto: [
        async ({}, use: (func: (endpoint?: string, options?: GoToOptions) => Promise<null | Response>) => Promise<void>) => {
            await use((endpoint = '/', options?: GoToOptions) => BrowserInstance.currentPage.goto(endpoint, options));
        },
        { scope: 'test' },
    ],
    initBrowserInstance: [
        async ({ page, context }: { page: Page; context: BrowserContext }, use: () => Promise<void>) => {
            BrowserInstance.withPage(page);
            // Get isMobile from Playwright context options (using internal API as it's the only way)
            const options = (context as any)._options || {};
            BrowserInstance.isContextMobile = Boolean(options.isMobile);
            await use();
            BrowserInstance.currentPage = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.browser = undefined;
        },
        { scope: 'test', auto: true }
    ],
    usePage: [
        async ({}, use) => {
            await use(<T>(page: Page, callback: () => Promise<T>) => usePage<T>(page, callback));
        },
        { scope: 'test' }
    ],
    testPage: [
        async ({ page }, use: (testPage: Page) => Promise<void>) => {
            await page.setContent('<html><body><h1>Test</h1><div id="test"></div><input type="text" id="input"></input></body></html>');
            await use(page);
        },
        { scope: 'test' }
    ]
});

export { expect };
