import { $, BrowserInstance, BrowserName } from "../src";
import { test } from "mocha";
import chai, { expect } from "chai";
import path from "path";
import chaiAsPromised from 'chai-as-promised'

const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;

chai.use(chaiAsPromised);

describe(`Web element build in helpers`, function () {

    this.timeout(10_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    after(async () => {
        await BrowserInstance.close();
    })

    test(`syncForEach should work with async callback`, async () => {
        const elements = $(`.field`);
        await elements.syncForEach( async (el) => await el.locator.type("1234567890"));
        const elementsTexts: (string | null)[] = [];
        await elements.syncForEach(async (e) => elementsTexts.push(await e.locator.inputValue()));
        expect(elementsTexts).has.members(["1234567890", "1234567890", "1234567890", "1234567890", "1234567890", "1234567890"]);
    })

    test(`syncForEach should work with sync callback`, async () => {
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.syncForEach((el) => el.locator.textContent().then(value => elementsTexts.push(value)));
        expect(elementsTexts).has.members(["1", "2", "3", "4", "5", "6", "text"]);
    })

    test(`asyncForEach should work with async callback`, async () => {
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.asyncForEach(async (e) => elementsTexts.push(await e.locator.textContent()));
        expect(elementsTexts).has.members(["1", "2", "3", "4", "5", "6", "text"]);
    })

    test(`asyncForEach should work with sync callback`, async () => {
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.asyncForEach((el) => el.locator.textContent().then(value => elementsTexts.push(value)));
        expect(elementsTexts).has.members(["1", "2", "3", "4", "5", "6", "text"]);
    })

    test(`map should work with async callback`, async () => {
        const elements = $(`li`);
        const elementsText = await elements.map( async (el) => await el.locator.textContent());
        expect(elementsText).has.all.members(["1", "2", "3", "4", "5", "6", "text"]);
    })

    test(`map should work with sync callback`, async () => {
        const elements = $(`li`);
        const selectors = await elements.map( (el) => el.selector);
        expect(selectors).has.all.members(["li >> nth=0", "li >> nth=1", "li >> nth=2", "li >> nth=3", "li >> nth=4", "li >> nth=5", "li >> nth=6"]);
    })

    test(`filter should work with async callback`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filter( async (el) => {
            const text = await el.locator.textContent();
            return text ? text.includes("text") : false;
        });
        expect(filtered).has.length(1);
        expect(await filtered[0]._.textContent()).to.be.equal("text");
    })

    test(`filter should work with sync callback`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filter( (el) => el.selector.includes("5"));
        expect(filtered).has.length(1);
        expect(filtered[0].selector).to.be.equal("li >> nth=5");
    })

});
