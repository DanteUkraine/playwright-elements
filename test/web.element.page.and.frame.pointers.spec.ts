import { $, BrowserInstance, BrowserName } from '../src';
import { test } from 'mocha';
import { expect } from 'chai';
import { localFilePath } from './utils'

describe(`Web element frame pointer`, function () {

    this.timeout(10_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.setDefaultTimeout(2_500);
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    after(async () => {
        await BrowserInstance.close();
    })

    test(`contentFrame make WebElement to be used as frameLocator`,  async () => {
        const iframe = $(`iframe`).contentFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        expect(await iframe.title._.textContent()).to.equal('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain`,  async () => {
        expect(await $(`iframe`).contentFrame().$(`.navbar__title`).first()._.textContent())
            .to.equal('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain after another element`,  async () => {
        expect(await $('body').$(`iframe`).contentFrame().$(`.navbar__title`).first()._.textContent())
            .to.equal('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in chain and sub elements`,  async () => {
        const iframe = $('body').$(`iframe`).contentFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        expect(await iframe.title._.textContent()).to.equal('Playwright');
    })

    test(`asFrame make WebElement to be used as frameLocator in sub elements on second nested level`,  async () => {
        const body = $('body').subElements({
            iframe: $(`iframe`).contentFrame()
                .subElements({
                    title: $(`.navbar__title`).first()
                })
        });
        expect(await body.iframe.title._.textContent()).to.equal('Playwright');
    })

});
