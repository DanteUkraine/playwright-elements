import { $, BrowserInstance, BrowserName } from "../src";
import { test } from "mocha";
import chai, { expect } from "chai";
import path from "path";
import chaiAsPromised from 'chai-as-promised'

const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;

chai.use(chaiAsPromised);

describe(`Web element page and frame pointers`, function () {

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

    test(`useFirst should point on first element from list`, (done) => {
        const firstElement = $(`li`).useFirst();
        expect(firstElement._.textContent()).to.become("1").and.notify(done);
    })

    test(`without useFirst should throw error`, (done) => {
        const elements = $(`li`);
        expect(elements._.textContent()).to.be
            .rejectedWith("strict mode violation: \"li\" resolved to 7 elements").and.notify(done);
    })

    test(`useStrict should decline useFirst effect`,  (done) => {
        const firstElement = $(`li`).useFirst();
        expect(firstElement._.textContent()).to.become("1");
        firstElement.useStrict();
        expect(firstElement._.textContent()).to.be
            .rejectedWith("strict mode violation: \"li\" resolved to 7 elements").and.notify(done);
    })

    test(`asFrame make WebElement to be used as frameLocator`,  (done) => {
        const iframe = $(`iframe`).asFrame()
            .subElements({
                title: $(`.navbar__title`).useFirst()
            });
        expect(iframe.title._.textContent()).to.become("Playwright").and.notify(done);
    })

});
