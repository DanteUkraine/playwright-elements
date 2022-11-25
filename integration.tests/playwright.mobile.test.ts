import {BrowserInstance, expect, test, $, initDesktopOrMobile} from "../src";
import {devices} from "@playwright/test";


test.use({...devices['iPhone 13']})

test.describe(`Playwright mobile test integration`, () => {

    test(`isMobile flag`,() => {
        expect(BrowserInstance.isContextMobile).toBeTruthy();
    })

    test(`initDesktopOrMobile helper`, () => {
        expect(initDesktopOrMobile($(`.desktop`), $(`.mobile`)).narrowSelector).toEqual(`.mobile`);
    })
})
