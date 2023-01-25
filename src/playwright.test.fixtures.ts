import { test as base, Page, Response, TestInfo } from '@playwright/test';
import { BrowserInstance } from './browser'
import { isBoolean } from "lodash";
export { expect } from "@playwright/test";

type WrappedFixtures = {
    baseURL: string | undefined,
    isMobile?: boolean;
    page: Page
}

type GoToOptions = {
    referer?: string | undefined,
    timeout?: number | undefined,
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit" | undefined
}

function isTestUseGoto(testInfo: TestInfo): boolean {
    return /\(\{(.*,)?goto(,.*)?\}\)/g.test(testInfo.fn.toString().replaceAll(/\n|\r|\s/g, ''));
}

export const test = base.extend<{
    implicitNavigation: void,
    goto: (endpoint: string, options?: GoToOptions) => Promise<null | Response>,
    initBrowserInstance: void
}>({
    implicitNavigation: [
        async ({baseURL, page}: WrappedFixtures, use: () => Promise<void>, testInfo: TestInfo) => {
            if (!isTestUseGoto(testInfo) && baseURL) await page.goto(baseURL);
            await use();
        },
        { scope: 'test', auto: true }],
    goto: [
        async ({ page }: { page: Page }, use: (func: (endpoint: string) => Promise<null | Response>) => Promise<void>) => {
            await use((endpoint: string, options?: GoToOptions) => page.goto(endpoint, options));
        },
        { scope: 'test' },
    ],
    initBrowserInstance: [
        async ({ isMobile, page }: WrappedFixtures, use: () => Promise<void>) => {
            BrowserInstance.withPage(page);
            BrowserInstance.isContextMobile = isBoolean(isMobile)? isMobile : false;
            await use();
            BrowserInstance.currentPage = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.browser = undefined;
        },
        { scope: 'test', auto: true }
    ],
});
