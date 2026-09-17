import { test as base, Page, Response, expect } from '@playwright/test';
import type { Locator } from 'playwright-core';
import { BrowserInstance, usePage } from './browser';
import { WebElement } from './web.element';
import { setTestIdAttribute } from './testIds/selectors';

type LocatorExpect = ReturnType<typeof expect<Locator>>;

// Configure the expectation provider with proper types
WebElement.setExpectProvider({
    expect: expect,
    softExpect: expect.soft
});

// Type augmentation: When using playwright-elements/test, the expect() and softExpect()
// methods should return Playwright's full LocatorExpect type
// We augment the WebElement class from the main entry point
declare module './web.element' {
    interface WebElement {
        expect(message?: string): LocatorExpect;
        softExpect(message?: string): LocatorExpect;
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
    testIdAttributeBridge: void,
    usePage: <T>(page: Page, callback: () => Promise<T>) => Promise<T>
}>({
    goto: [
        async ({}, use: (func: (endpoint?: string, options?: GoToOptions) => Promise<null | Response>) => Promise<void>) => {
            await use((endpoint = '/', options?: GoToOptions) => BrowserInstance.currentPage.goto(endpoint, options));
        },
        { scope: 'test' },
    ],
    initBrowserInstance: [
        async ({ isMobile, page }: { isMobile?: boolean; page: Page }, use: () => Promise<void>) => {
            BrowserInstance.withPage(page);
            // Use Playwright's public isMobile fixture value (backward compatible with v1.18.2)
            BrowserInstance.isContextMobile = Boolean(isMobile);
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
    testIdAttributeBridge: [
        async ({ testIdAttribute }: { testIdAttribute?: string }, use: () => Promise<void>) => {
            // Sync the $byTestId* CSS selectors with Playwright's use.testIdAttribute config.
            // Playwright's native getByTestId already respects this; our CSS-based selectors
            // need to be told explicitly because they don't go through Playwright's locator chain.
            setTestIdAttribute(testIdAttribute ?? 'data-testid');
            await use();
        },
        { scope: 'test', auto: true }
    ]
});

export { expect };
