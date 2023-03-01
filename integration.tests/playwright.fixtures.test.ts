import { test, expect, $, BrowserInstance, initDesktopOrMobile } from '../src';

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

    test.skip(`custom expect matcher`, async ({ goto }) => {
        await goto('/', { waitUntil: 'domcontentloaded' });
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`),
            });
        await header.logo.expect().toBeVisible();
    })

    test(`isMobile flag`, () => {
        expect(BrowserInstance.isContextMobile).toBeFalsy();
    })

    test(`initDesktopOrMobile helper`, () => {
        expect(initDesktopOrMobile($(`.desktop`), $(`.mobile`)).narrowSelector).toEqual(`.desktop`);
    })
})


