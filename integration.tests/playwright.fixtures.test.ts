import {test, $} from "../src";
import {expect} from "@playwright/test";

test.describe(`Playwright test integration`, () => {

    test(`expect positive`, async () => {
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`)
            });
        await header.logo.expect().toBeVisible();
        await header.logo.expect().toHaveText("Playwright");
    })

    test(`soft expect negative`, async () => {
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`),
            });
        await header.logo.softExpect().not.toBeVisible({ timeout: 500 });
        await header.logo.softExpect().not.toHaveText("Playwright", { timeout: 500 });
        expect(test.info().errors).toHaveLength(2);
        test.fail()
    })

    test(`goto fixture should navigate to endpoint`, async ({ goto }) => {
        const res = await goto('/docs/test-typescript');
        expect(res?.ok()).toBeTruthy();
    })

})


