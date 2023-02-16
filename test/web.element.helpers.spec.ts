import { $, BrowserInstance, BrowserName } from '../src';
import { test } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised'
import { isArray } from 'lodash';
import { localFilePath } from './utils'

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
        await elements.syncForEach( async (el) => await el.type('1234567890'));
        const elementsTexts: (string | null)[] = [];
        await elements.syncForEach(async (e) => elementsTexts.push(await e.inputValue()));
        expect(elementsTexts).has.members(['1234567890', '1234567890', '1234567890', '1234567890', '1234567890', '1234567890']);
    })

    test(`syncForEach should work with sync callback`, async () => {
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.syncForEach((el) => el.textContent().then(value => elementsTexts.push(value)));
        expect(elementsTexts).has.members(['1', '2', '3', '4', '5', '6', 'text']);
    })

    test(`asyncForEach should work with async callback`, async () => {
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.asyncForEach(async (e) => elementsTexts.push(await e.textContent()));
        expect(elementsTexts).has.members(['1', '2', '3', '4', '5', '6', 'text']);
    })

    test(`asyncForEach should work with sync callback`, async () => {
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.asyncForEach((el) => el.textContent().then(value => elementsTexts.push(value)));
        expect(elementsTexts).has.members(['1', '2', '3', '4', '5', '6', 'text']);
    })

    test(`map should work with async callback`, async () => {
        const elements = $(`li`);
        const elementsText = await elements.map( async (el) => await el.textContent());
        expect(isArray(elementsText)).to.be.true
        expect(elementsText).has.all.members(['1', '2', '3', '4', '5', '6', 'text']);
    })

    test(`map should work with sync callback`, async () => {
        const elements = $(`li`);
        const selectors = await elements.map( (el) => el.textContent());
        expect(isArray(selectors)).to.be.true
        expect(selectors).has.all.members(['1', '2', '3', '4', '5', '6', 'text']);
    })

    test(`filter should work with async callback`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filter( async (el) => {
            const text = await el.textContent();
            return text ? text.includes('text') : false;
        });
        expect(filtered).has.length(1);
        expect(await filtered[0].textContent()).to.be.equal('text');
    })

    test(`filter should work with sync callback`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filter( (el) => el.textContent().then(value => value ? value.includes('5') : false));
        expect(filtered).has.length(1);
        expect(await filtered[0].textContent()).to.be.equal('5');
    })

});
