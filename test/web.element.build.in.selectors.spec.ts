import {
    $,
    $getByAltText,
    $getByLabel,
    $getByPlaceholder,
    $getByRole,
    $getByTestId,
    $getByText,
    $getByTitle,
    BrowserInstance,
    BrowserName
} from '../src';
import { test } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { localFilePath } from './utils'

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

    test(`getByText for string should point on origin element`, async () => {
        const visibleElement = $(`*css=#visible-target`).$getByText('visible target');
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).to.be.equal('visible-target');
    })

    test(`getByText for string should point on sub element`, async () => {
        const visibleElement = $(`#visible-target`).$getByText('is visible target');
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).to.be.equal('target');
    })

    test(`first should point on first element`, async () => {
        const visibleElement = $(`li`).first();
        const elementId = await visibleElement._.textContent();
        expect(elementId).to.be.equal('1');
    })

    test(`last should point on last element`, async () => {
        const visibleElement = $(`li`).last();
        const elementId = await visibleElement._.textContent();
        expect(elementId).to.be.equal('text');
    })

    test(`nth should point on element by index element`, async () => {
        const visibleElement = $(`li`).nth(3);
        const elementId = await visibleElement._.textContent();
        expect(elementId).to.be.equal('4');
    })

    test(`has with string argument should point on element witch has specific child`, async () => {
        const visibleElement = $(`#visible-target div`).has(`#right-target`);
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).to.be.equal('inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child`, async () => {
        const visibleElement = $(`#visible-target div`).has($(`#right-target`));
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).to.be.equal('inner-visible-target2');
    })

    test(`hasText with WebElement argument should point on element witch has specific text`, async () => {
        const element = $(`li`).hasText('text');
        expect(await element.count()).to.be.equal(1);
    })

    test(`hasText with WebElement argument should point on element witch has specific child with text`, async () => {
        const element = $(`ul`).hasText('text');
        expect(await element.$('li').count()).to.be.equal(7);
    })

    test(`has with sub elements argument should point on element witch has specific parent`, async () => {
        const visibleElement = $(`#visible-target div`)
            .subElements({
                paragraph: $(`p[hidden]`)
            });
        expect(visibleElement.has($('#right-target')).first().selector).to.be.equal('#visible-target div >> internal:has=\"#right-target\"');
        await visibleElement.has($('#right-target')).paragraph.expect().toHaveText('This is hidden right target');
    })

    test(`get by alt text selector method`, async () => {
        expect(await $getByAltText('alt text').getAttribute('alt')).to.equal('This is the alt text');
        expect(await $('body').$getByAltText('alt text').getAttribute('alt')).to.equal('This is the alt text');
    })

    test(`get by label selector method`, async () => {
        expect(await $getByLabel('Checked box', {exact: true}).getAttribute('id')).to.equal('checked');
        expect(await $getByLabel('Checked box').map(el => el.getAttribute('id'))).to.have.members(['checked', 'unchecked']);
        expect(await $('body').$getByLabel('Checked box', {exact: true}).getAttribute('id')).to.equal('checked');
        expect(await $('body').$getByLabel('Checked box').map(el => el.getAttribute('id'))).to.have.members(['checked', 'unchecked']);
    })

    test(`get by placeholder selector method`, async () => {
        const element = $('fieldset').subElements({ input: $getByPlaceholder('enabled') });
        expect(await element.input.getAttribute('id')).to.equal('enabled-field');
    })

    test(`get by role selector method`, async () => {
        const elements = $getByRole('list');
        expect(await elements.count()).to.equal(2);
    })

    test(`get by test id selector method`, async () => {
        const element = $getByTestId('main-title');
        expect(await element.textContent()).to.equal('Hello Playwright elements');
    })

    test(`get by text selector method`, async () => {
        const element = $getByText('Hello Playwright');
        expect(await element.textContent()).to.equal('Hello Playwright elements');
    })

    test(`get by title selector method`, async () => {
        const element = $getByTitle('Submit button');
        expect(await element.textContent()).to.equal('Button');
    })

    test(`get by with direct child plus has`, async () => {
        const element = $getByTestId('test-div').$('div')
            .subElements({
                p: $('p')
            })
        expect(await element.has('#inner-visible-target').p.$getByText('Second visible target').isVisible()).to.be.true;
    })

    test(`get by selector methods should not be used with has method`, async () => {
        expect(() => $getByAltText('list').has('#child'))
            .to.throw('has option can not be used with getByAltText, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByLabel('list').has('#child'))
            .to.throw('has option can not be used with getByLabel, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByPlaceholder('list').has('#child'))
            .to.throw('has option can not be used with getByPlaceholder, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByRole('list').has('#child'))
            .to.throw('has option can not be used with getByRole, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByTestId('title').has('#child'))
            .to.throw('has option can not be used with getByTestId, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByText('title').has('#child'))
            .to.throw('has option can not be used with getByText, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByTitle('title').has('#child'))
            .to.throw('has option can not be used with getByTitle, it can be used only with $ or new WebElement(\'#id\') syntax.');
    })
});
