import {test as base, Page, Response} from '@playwright/test';
import {BrowserInstance} from './browser';

export {expect} from "@playwright/test";

type WrappedFixtures = {
    baseURL: string | undefined,
    page: Page
}

type GoToOptions = {
    referer?: string | undefined,
    timeout?: number | undefined,
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit" | undefined
}

export const test = base.extend<{
    navigation: void,
    goto: (endpoint: string, options?: GoToOptions) => Promise<null | Response>,
    browserInstance: BrowserInstance
}>({
    navigation: [
        async ({baseURL, page}: WrappedFixtures, use: () => Promise<void>) => {
            if (baseURL) await page.goto(baseURL);
            await use();
        },
        {scope: "test", auto: true}],
    goto: [
        async ({page}: { page: Page }, use: (func: (endpoint: string) => Promise<null | Response>) => Promise<void>) => {
            await use((endpoint: string, options?: GoToOptions) => page.goto(endpoint, options));
        },
        {scope: "test"},
    ],
    browserInstance: [
        async ({page}: WrappedFixtures, use: (browserInstance: BrowserInstance) => Promise<void>) => {
            BrowserInstance.withPage(page);
            await use(BrowserInstance);
            BrowserInstance.currentPage = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.browser = undefined;
        },
        {scope: "test", auto: true}
    ]
});
