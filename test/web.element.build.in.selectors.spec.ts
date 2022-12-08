import { $, BrowserInstance, BrowserName } from "../src";
import { test } from "mocha";
import chai, { expect } from "chai";
import path from "path";
import chaiAsPromised from 'chai-as-promised'

const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;

chai.use(chaiAsPromised);

describe(`Web element build in selectors`, function () {

    this.timeout(20_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.setDefaultTimeout(10_000);
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    after(async () => {
        await BrowserInstance.close();
    })

    test(`withVisible should point on origin element`, async () => {
        const visibleElement = $(`#visible-target`).withVisible();
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("visible-target");
    })

    test(`withText for string should point on origin element`, async () => {
        const visibleElement = $(`*css=#visible-target`).withText("visible target");
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("visible-target");
    })

    test(`withText for string should point on sub element`, async () => {
        const visibleElement = $(`#visible-target`).withText("is visible target");
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("target");
    })

    test(`withText for regex should point on origin element`, async () => {
        const visibleElement = $(`*css=#visible-target`).withText(/visible\starget/);
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("visible-target");
    })

    test(`withText regex should point on sub element`, async () => {
        const visibleElement = $(`#visible-target`).withText(/is\svisible\starget/);
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("target");
    })

    test(`whereTextIs should point on original element`, async () => {
        const visibleElement = $(`*css=#visible-target`).whereTextIs("Second visible target");
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("visible-target");
    })

    test(`whereTextIs should point on sub element`, async () => {
        const visibleElement = $(`#visible-target`).whereTextIs("Second visible target");
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("second-target");
    })

    test(`first should point on first element`, async () => {
        const visibleElement = $(`li`).first();
        const elementId = await visibleElement._.textContent();
        expect(elementId).to.be.equal("1");
    })

    test(`last should point on last element`, async () => {
        const visibleElement = $(`li`).last();
        const elementId = await visibleElement._.textContent();
        expect(elementId).to.be.equal("text");
    })

    test(`nth should point on element by index element`, async () => {
        const visibleElement = $(`li`).nth(3);
        const elementId = await visibleElement._.textContent();
        expect(elementId).to.be.equal("4");
    })

    test(`has with string argument should point on element witch has specific child`, async () => {
        const visibleElement = $(`#visible-target div`).has(`#right-target`);
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("inner-visible-target2");
    })

    test(`has with WebElement argument should point on element witch has specific child`, async () => {
        const visibleElement = $(`#visible-target div`).has($(`#right-target`));
        const elementId = await visibleElement._.getAttribute("id");
        expect(elementId).to.be.equal("inner-visible-target2");
    })

    test(`has with sub elements argument should point on element witch has specific parent`, async () => {
        const visibleElement = $(`#visible-target div`)
            .subElements({
                paragraph: $(`p[hidden]`)
            });
        expect(visibleElement.has($('#right-target')).first().selector).to.be.equal("#visible-target div >> internal:has=\"#right-target\" >> nth=0");
        expect(visibleElement.first().has($('#right-target')).selector).to.be.equal("#visible-target div >> nth=0 >> internal:has=\"#right-target\"");
        await visibleElement.has($('#right-target')).paragraph.expect().toHaveText("This is hidden right target");
    })

});
