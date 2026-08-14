import { test, expect } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test

test.describe(`Web element frame pointer`, () => {

    test.beforeEach(async ({ initBrowserInstance, page, goto }) => {
        await goto(localFilePath);
        await page.waitForSelector('h1');
    })

    test.afterEach(async ({ initBrowserInstance }) => {
        // BrowserInstance cleanup is handled automatically by the fixture
    })

    test(`contentFrame make WebElement to be used as frameLocator`,  async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const iframe = $(`iframe`).contentFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        expect(await iframe.title._.textContent()).toEqual('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain`,  async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        expect(await $(`iframe`).contentFrame().$(`.navbar__title`).first()._.textContent())
            .toEqual('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain after another element`,  async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        expect(await $('body').$(`iframe`).contentFrame().$(`.navbar__title`).first()._.textContent())
            .toEqual('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain and sub elements`,  async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const iframe = $('body').$(`iframe`).contentFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        expect(await iframe.title._.textContent()).toEqual('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in sub elements on second nested level`,  async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const body = $('body').subElements({
            iframe: $(`iframe`).contentFrame()
                .subElements({
                    title: $(`.navbar__title`).first()
                })
        });
        expect(await body.iframe.title._.textContent()).toEqual('Playwright');
    })
})
