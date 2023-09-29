import { $, BrowserInstance, BrowserName } from '../src';
import { test } from 'mocha';
import { expect } from 'chai';
import { isArray } from 'lodash';
import { localFilePath } from './utils'


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
        await elements.syncForEach( async (el) => await el.pressSequentially('1234567890'));
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

    test(`filterElements should work with async callback`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filterElements( async (el) => {
            const text = await el.textContent();
            return text ? text.includes('text') : false;
        });
        expect(filtered).has.length(1);
        expect(await filtered[0].textContent()).to.be.equal('text');
    })

    test(`filterElements should work with sync callback`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filterElements( (el) => el.textContent().then(value => value ? value.includes('5') : false));
        expect(filtered).has.length(1);
        expect(await filtered[0].textContent()).to.be.equal('5');
    })

    test(`filter should work with has child`, async () => {
        const elements = $(`div#visible-target`).$('div');
        const filtered = await elements.filter({ has: $('#right-target') });
        expect(await filtered.getAttribute('id')).to.be.equal('inner-visible-target2');
    })

    test(`filter should work with hasNot child`, async () => {
        const elements = $(`div#visible-target`).$('div');
        const filtered = await elements.filter({ hasNot: $('#wrong-target, #wrong-target2') });
        expect(await filtered.getAttribute('id')).to.be.equal('inner-visible-target2');
    })

    test(`filter should work with has text`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filter({ hasText: 'text' });
        expect(await filtered.textContent()).to.be.equal('text');
    })

    test(`filter should work with has not text`, async () => {
        const elements = $(`li`);
        const filtered = await elements.filter({ hasNotText: /[0-6]/ });
        expect(await filtered.textContent()).to.be.equal('text');
    })

    test(`filter should work with multiple options`, async () => {
        const elements = $(`div`);
        const filtered = elements.filter({ has: '#right-target', hasNot: '#missed', hasText: 'Visible target', hasNotText: 'Visible wrong target' });
        expect(await filtered.getAttribute('id')).to.be.equal('inner-visible-target2');
    })

});
