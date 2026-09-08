import { test as base, Page, Response, expect } from '@playwright/test';
import type { Locator } from 'playwright-core';
import type { Expect } from '@playwright/test';
import { BrowserInstance, usePage } from './browser';
import { WebElement } from './web.element';
export { expect } from '@playwright/test';

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
    usePage: <T>(page: Page, callback: () => Promise<T>) => Promise<T>
}>({
    goto: [
        async ({}, use: (func: (endpoint?: string, options?: GoToOptions) => Promise<null | Response>) => Promise<void>) => {
            await use((endpoint = '/', options?: GoToOptions) => BrowserInstance.currentPage.goto(endpoint, options));
        },
        { scope: 'test' },
    ],
    initBrowserInstance: [
        async ({ page }: { page: Page }, use: () => Promise<void>) => {
            BrowserInstance.withPage(page);
            // Removed dependency on private context._options API
            // This sets a default; users can access isMobile through Playwright's built-in fixture
            BrowserInstance.isContextMobile = false;
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
    ]
});
