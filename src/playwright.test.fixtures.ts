import { test as base, Page, Response, expect } from '@playwright/test';
import { BrowserInstance, usePage, WebElement } from './index';
export { expect } from '@playwright/test';

// Configure WebElement assertion provider automatically for Playwright tests
// This decouples the core WebElement from @playwright/test while maintaining convenience
WebElement.setExpectProvider({
    expect: expect,
    softExpect: expect.soft
});

type WrappedFixtures = {
    baseURL: string | undefined,
    isMobile?: boolean;
    page: Page
}

type GoToOptions = {
    referer?: string | undefined,
    timeout?: number | undefined,
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' | undefined
}

export const test = base.extend<{
    implicitNavigation: void,
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
        async ({ isMobile, page }: WrappedFixtures, use: () => Promise<void>) => {
            // Initialize BrowserInstance with fixture-scoped page (F-003 fix)
            // This ensures proper cleanup and prevents static state leakage
            BrowserInstance.withPage(page);
            BrowserInstance.isContextMobile = Boolean(isMobile);
            await use();
            // Cleanup: Clear static state to prevent cross-test contamination
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
