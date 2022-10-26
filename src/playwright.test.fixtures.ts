import {test as base, Page} from '@playwright/test';
import {BrowserInstance} from './browser';

type WrappedFixtures = {
    baseURL: string | undefined,
    page: Page
}

export const test = base.extend<{ initElements: BrowserInstance }>({
    initElements: [async ({baseURL, page}: WrappedFixtures, use: (browserInstance: BrowserInstance) => Promise<void>) => {
        BrowserInstance.withPage(page);
        if (baseURL) await BrowserInstance.currentPage.goto(baseURL);
        await use(BrowserInstance);
        BrowserInstance.currentPage = undefined;
        BrowserInstance.currentContext = undefined;
        BrowserInstance.browser = undefined;
    }, {auto: true}]
});
