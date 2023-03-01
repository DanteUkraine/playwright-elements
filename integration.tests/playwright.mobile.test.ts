import { BrowserInstance, expect, test, $, initDesktopOrMobile, WebElement } from '../src';
import { devices } from '@playwright/test';


test.use({ ...devices['iPhone 13'] })

test.describe(`Playwright mobile test integration`, () => {

    test(`isMobile flag`,() => {
        expect(BrowserInstance.isContextMobile).toBeTruthy();
    })

    test(`initDesktopOrMobile helper`, () => {
        expect(initDesktopOrMobile($(`.desktop`), $(`.mobile`)).narrowSelector).toEqual(`.mobile`);
    })

    test(`initDesktopOrMobile where elements with common methods`, async () => {
        const desktop = $(`.desktop`)
            .subElements({
                button: $(`button`),
            }).withMethods({
                commonMethod(this: WebElement & { button: WebElement }) {
                  return this.button;
                }
            });
        const mobile = $(`.mobile`)
            .subElements({
                hamburgerMenu: $(`div`),
                button: $(`button`),
            }).withMethods({
                 commonMethod(this: WebElement & { hamburgerMenu: WebElement, button: WebElement }) {
                    return this.hamburgerMenu
                }
            })
        const element = initDesktopOrMobile(desktop, mobile);
        expect(element.commonMethod().narrowSelector).toEqual(`div`);
    })
})
