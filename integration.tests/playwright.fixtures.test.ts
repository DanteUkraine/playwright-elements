import { expect, $, BrowserInstance, initDesktopOrMobile, test as originalTest } from '../src/index';
import { localFilePath } from '../test/utils';
import { mergeTests, test as baseTest } from '@playwright/test';

type TestFixtures = { newOne: string };
export const additionalFixtures = baseTest.extend<TestFixtures>({
    newOne: [async ({}, use) => await use('newOne'), { scope: 'test' }]
});

export const test = mergeTests(originalTest, additionalFixtures);


test.describe(`Playwright test integration`, () => {

    test(`expect positive`, async ({ goto }) => {
        await goto();
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`)
            });
        await header.logo.expect().toBeVisible();
        await header.logo.expect().toHaveText('Playwright');
    })

    test(`soft expect negative`, async ({ goto }) => {
        await goto();
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`),
            });
        await header.logo.softExpect().not.toBeVisible({ timeout: 500 });
        await header.logo.softExpect().not.toHaveText('Playwright', { timeout: 500 });
        expect(test.info().errors).toHaveLength(2);
        test.fail()
    })

    test(`goto fixture should navigate to endpoint`, async ({ goto }) => {
        await expect(BrowserInstance.currentPage).toHaveURL('about:blank')
        // Use relative path - baseURL is configurable via PLAYWRIGHT_BASE_URL, default is https://playwright.dev
        await goto('/docs/test-typescript');
        // Response may be null for same-origin navigations, check URL instead
        expect(BrowserInstance.currentPage.url()).toContain('test-typescript');
    })

    test(`BrowserInstance.currentPage should switch tab automatically`, async ({ goto }) => {
        await goto(localFilePath);
        await $('button[title=Navigation]').click();
        // Use relative URL check since baseURL is configurable via PLAYWRIGHT_BASE_URL
        await expect.poll(() => BrowserInstance.currentPage.url()).toMatch(/\/$/);
    })

    test(`isMobile flag`, () => {
        expect(BrowserInstance.isContextMobile).toBeFalsy();
    })

    test(`initDesktopOrMobile helper`, () => {
        expect(initDesktopOrMobile($(`.desktop`), $(`.mobile`)).narrowSelector).toEqual(`.desktop`);
    })

    test('is fixtures merged', ({ newOne }) => {
        expect(newOne).toEqual('newOne');
    })
})


