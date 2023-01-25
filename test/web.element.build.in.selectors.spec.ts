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
} from "../src";
import { test } from "mocha";
import chai, { expect } from "chai";
import path from "path";
import chaiAsPromised from 'chai-as-promised';

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

    test(`get by alt text selector method`, async () => {
        expect(await $getByAltText('alt text').locator.getAttribute('alt')).to.equal('This is the alt text');
        expect(await $('body').$getByAltText('alt text').locator.getAttribute('alt')).to.equal('This is the alt text');
    })

    test(`get by label selector method`, async () => {
        expect(await $getByLabel('Checked box', {exact: true}).locator.getAttribute('id')).to.equal('checked');
        expect(await Promise.all((await $getByLabel('Checked box').locator.all()).map(el => el.getAttribute('id')))).to.have.members(['checked', 'unchecked']);
        expect(await $('body').$getByLabel('Checked box', {exact: true}).locator.getAttribute('id')).to.equal('checked');
        expect(await Promise.all((await $('body').$getByLabel('Checked box').locator.all()).map(el => el.getAttribute('id')))).to.have.members(['checked', 'unchecked']);
    })

    test(`get by placeholder selector method`, async () => {
        const element = $('fieldset').subElements({ input: $getByPlaceholder('enabled') });
        expect(await element.input.locator.getAttribute('id')).to.equal('enabled-field');
    })

    test(`get by role selector method`, async () => {
        const elements = $getByRole('list');
        expect(await elements.locator.count()).to.equal(2);
    })

    test(`get by test id selector method`, async () => {
        const element = $getByTestId('main-title');
        expect(await element.locator.textContent()).to.equal('Hello Playwright elements');
    })

    test(`get by text selector method`, async () => {
        const element = $getByText('Hello Playwright');
        expect(await element.locator.textContent()).to.equal('Hello Playwright elements');
    })

    test(`get by title selector method`, async () => {
        const element = $getByTitle('Submit button');
        expect(await element.locator.textContent()).to.equal('Button');
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
