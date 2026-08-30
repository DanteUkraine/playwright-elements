import { BrowserInstance, expect, test, $, initDesktopOrMobile, WebElement } from '../src/index';
import { devices } from '@playwright/test';
import { expectMobileContext } from '../test/utils/mobile.validators';

test.use({ ...devices['iPhone 13'] })

test.describe(`Playwright mobile test integration`, () => {

    test(`isMobile flag and mobile behavior`, async () => {
        await expectMobileContext(BrowserInstance.currentPage, { expectedDevice: 'iPhone' });
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
