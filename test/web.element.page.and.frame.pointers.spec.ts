import { $, BrowserInstance, BrowserName } from '../src';
import { test } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised'
import { localFilePath } from './utils'

chai.use(chaiAsPromised);

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

    test(`asFrame make WebElement to be used as frameLocator`,  (done) => {
        const iframe = $(`iframe`).asFrame()
            .subElements({
                title: $(`.navbar__title`).first()
            });
        expect(iframe.title._.textContent()).to.become('Playwright').and.notify(done);
    })

});
