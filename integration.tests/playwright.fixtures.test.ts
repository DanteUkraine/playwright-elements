import {test, $} from "../src";
import {expect} from "@playwright/test";

test.describe(`Playwright test integration`, () => {

    test(`expect positive`, async () => {
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`),
            });
        await header.logo.expect().toBeVisible();
        await header.logo.expect().toHaveText("Playwright");
    })

    test(`soft expect negative`, async () => {
        const header = $(`.navbar`)
            .subElements({
                logo: $(`.navbar__title`),
            });
        await header.logo.softExpect().not.toBeVisible();
        await header.logo.softExpect().not.toHaveText("Playwright");
        expect(test.info().errors).toHaveLength(2);
        test.fail()
    })

})


