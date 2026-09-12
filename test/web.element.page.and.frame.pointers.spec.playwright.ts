import { test, expect } from '../src';
import { localFilePath } from './utils';


test.describe(`Web element frame pointer`, () => {

    test.beforeEach(async ({ page, goto }) => {
        await goto(localFilePath);
        await page.locator('h1').waitFor();
    })

    test.afterEach(async () => {
        // BrowserInstance cleanup is handled automatically by the fixture
    })

    test(`contentFrame make WebElement to be used as frameLocator`,  async () => {
        const { $ } = await import('../src');
        const iframe = $(`iframe`).contentFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        await expect(iframe.title.locator).toHaveText('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain`,  async () => {
        const { $ } = await import('../src');
        await expect($(`iframe`).contentFrame().$(`.navbar__title`).first().locator).toHaveText('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain after another element`,  async () => {
        const { $ } = await import('../src');
        await expect($('body').$(`iframe`).contentFrame().$(`.navbar__title`).first().locator).toHaveText('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain and sub elements`,  async () => {
        const { $ } = await import('../src');
        const iframe = $('body').$(`iframe`).contentFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        await expect(iframe.title.locator).toHaveText('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in sub elements on second nested level`,  async () => {
        const { $ } = await import('../src');
        const body = $('body').subElements({
            iframe: $(`iframe`).contentFrame()
                .subElements({
                    title: $(`.navbar__title`).first()
                })
        });
        await expect(body.iframe.title.locator).toHaveText('Playwright');
    })
})
