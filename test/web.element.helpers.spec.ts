import { $, BrowserInstance, BrowserName } from '../src';
import { test } from 'mocha';
import { AssertionError, expect } from 'chai';
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
        expect(elementsText).has.all.members(['1', '2', '3', '4', '5', '6', 'text']);
    })

    test(`map should work with sync callback`, async () => {
        const elements = $(`li`);
        const selectors = await elements.map( (el) => el.textContent());
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

    test('get text method returns text', async () => {
        const title = $('[data-testid=main-title]');
        expect(await title.getText()).to.equal('Hello Playwright elements');
    });

    test('get text method throws error', async () => {
        const title = $('img');
        try {
            await title.getText()
        } catch (e) {
            expect(e).to.have.property('message', 'Text content method returned null for selector: "img"');
            return;
        }
        throw new AssertionError('Method getText should throw error.')
    })

});

describe('Web element handler', function () {
    this.timeout(25_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
    })

    after(async () => {
        await BrowserInstance.close();
    })

    test(`addHandler should execute callback`, async () => {
        const field1 = $('#field1');
        const field2 = $('#field2');
        const field3 = $('#field3')
            .with({ subElement: $('.dummy') });
        await field1.addHandler(async field => await field.fill('Field 1'), { noWaitAfter: true });
        await field2.addHandler(async field => await field.fill('Field 2'), { noWaitAfter: true });
        await field3.addHandler(async field => {
                await field.fill('Field 3');
                expect(field.subElement.selector).to.equal('.dummy'); // support tree structure in handler.
            },
            { noWaitAfter: true });
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
        await field1.expect().toHaveValue('Field 1');
        await field2.expect().toHaveValue('Field 2');
        await field3.expect().toHaveValue('Field 3');
    })

    test(`removeHandler should execute callback`, async () => {
        const field = $('#field1');
        await field.addHandler(async () => await field.fill('Field 1'));
        await field.removeHandler();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
        await field.expect().toHaveValue('');
    })
});