import { expect, $, BrowserInstance, initDesktopOrMobile, test as originalTest } from '../src/index.ts';
import { localFilePath } from '../test/utils.ts';
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
        const res = await goto('/docs/test-typescript');
        expect(res?.ok()).toBeTruthy();
    })

    test(`BrowserInstance.currentPage should switch tab automatically`, async ({ goto }) => {
        await goto(localFilePath);
        await $('button[title=Navigation]').click();
        await expect.poll(() => BrowserInstance.currentPage.url()).toEqual('https://playwright.dev/');
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


