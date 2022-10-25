import { test as base } from '@playwright/test';
import { BrowserInstance } from './browser';

export const test = base.extend<{initElements: BrowserInstance}>({
    initElements: [async ({ baseURL, page }, use) => {
        BrowserInstance.withPage(page);
        if(baseURL) await BrowserInstance.currentPage.goto(baseURL);
        await use(BrowserInstance);
        BrowserInstance.currentPage = undefined;
        BrowserInstance.currentContext = undefined;
        BrowserInstance.browser = undefined;
    }, {auto: true}]
});
