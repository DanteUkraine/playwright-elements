import {
    $,
    $getByAltText,
    $getByLabel,
    $getByPlaceholder,
    $getByRole,
    $getByTestId,
    $getByText,
    $getByTitle,
} from '../src';
import { test, expect } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test

test.describe(`Web element build in selectors`, () => {

    test.beforeEach(async ({ goto, page }) => {
        await goto(localFilePath);
        await page.waitForSelector('h1');
    })

    test(`getByText for string should point on origin element`, async ({ page }) => {
        const visibleElement = $(`*css=#visible-target`).$getByText('visible target');
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).toBe('visible-target');
    })

    test(`getByText for string should point on sub element`, async ({ page }) => {
        const visibleElement = $(`#visible-target`).$getByText('is visible target');
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).toBe('target');
    })

    test(`first should point on first element`, async ({ page }) => {
        const visibleElement = $(`li`).first();
        const elementId = await visibleElement._.textContent();
        expect(elementId).toBe('1');
    })

    test(`last should point on last element`, async ({ page }) => {
        const visibleElement = $(`li`).last();
        const elementId = await visibleElement._.textContent();
        expect(elementId).toBe('text');
    })

    test(`nth should point on element by index element`, async ({ page }) => {
        const visibleElement = $(`li`).nth(3);
        const elementId = await visibleElement._.textContent();
        expect(elementId).toBe('4');
    })

    test(`has with string argument should point on element witch has specific child`, async ({ page }) => {
        const visibleElement = $(`#visible-target div`).has(`#right-target`);
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).toBe('inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child`, async ({ page }) => {
        const visibleElement = $(`#visible-target div`).has($(`#right-target`));
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).toBe('inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child with specific text`, async ({ page }) => {
        const visibleElement = $(`#visible-target div`).has($('p').hasText('Visible target'));
        const elementId = await visibleElement._.getAttribute('id');
        expect(elementId).toBe('inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child with specific text and common parent`, async ({ page }) => {
        const testElement = $('[data-testid=test-div]').subElements({
            visibleElement: $(`#visible-target div`).has($('p').hasText('Visible target'))
        });
        const elementId = await testElement.visibleElement._.getAttribute('id');
        expect(elementId).toBe('inner-visible-target2');
    })

    test(`hasText with WebElement argument should point on element witch has specific text`, async ({ page }) => {
        const element = $(`li`).hasText('text');
        expect(await element.count()).toBe(1);
    })

    test(`hasText with WebElement argument should point on element witch has specific child with text`, async ({ page }) => {
        const element = $(`ul`).hasText('text');
        expect(await element.$('li').count()).toBe(7);
    })

    test(`has with sub elements argument should point on element witch has specific parent`, async ({ page }) => {
        const visibleElement = $(`#visible-target div`)
            .subElements({
                paragraph: $(`p[hidden]`)
            });
        expect(visibleElement.has($('#right-target')).first().selector).toBe('#visible-target div >> internal:has="#right-target"');
        await visibleElement.has($('#right-target')).paragraph.expect().toHaveText('This is hidden right target');
    })

    test(`get by alt text selector method`, async ({ page }) => {
        expect(await $getByAltText('alt text').getAttribute('alt')).toBe('This is the alt text');
        expect(await $('body').$getByAltText('alt text').getAttribute('alt')).toBe('This is the alt text');
    })

    test(`get by label selector method`, async ({ page }) => {
        expect(await $getByLabel('Checked box', { exact: true }).getAttribute('id')).toBe('checked');
        
        const result = await $getByLabel('Checked box').map(el => el.getAttribute('id'));
        expect(result).toContain('checked');
        expect(result).toContain('unchecked');
        
        expect(await $('body').$getByLabel('Checked box', { exact: true }).getAttribute('id')).toBe('checked');
        
        const result2 = await $('body').$getByLabel('Checked box').map(el => el.getAttribute('id'));
        expect(result2).toContain('checked');
        expect(result2).toContain('unchecked');
    })

    test(`get by placeholder selector method`, async ({ page }) => {
        const element = $('fieldset').subElements({ input: $getByPlaceholder('enabled') });
        expect(await element.input.getAttribute('id')).toBe('enabled-field');
    })

    test(`get by role selector method`, async ({ page }) => {
        const elements = $getByRole('list');
        expect(await elements.count()).toBe(2);
    })

    test(`get by test id selector method`, async ({ page }) => {
        const element = $getByTestId('main-title');
        expect(await element.textContent()).toBe('Hello Playwright elements');
    })

    test(`get by text selector method`, async ({ page }) => {
        const element = $getByText('Hello Playwright');
        expect(await element.textContent()).toBe('Hello Playwright elements');
    })

    test(`get by title selector method`, async ({ page }) => {
        const element = $getByTitle('Submit button');
        expect(await element.textContent()).toBe('Button');
    })

    test(`get by with direct child plus has`, async ({ page }) => {
        const element = $getByTestId('test-div').$('div')
            .subElements({
                p: $('p')
            })
        expect(await element.has('#inner-visible-target').p.$getByText('Second visible target').isVisible()).toBe(true);
    })

    test(`get by selector methods should not be used with has or hasNot methods`, async ({ page }) => {
        expect(() => $getByAltText('list').has('#child'))
            .toThrow('has option can not be used with getByAltText, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByAltText('list').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByAltText, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByLabel('list').has('#child'))
            .toThrow('has option can not be used with getByLabel, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByLabel('list').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByLabel, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByPlaceholder('list').has('#child'))
            .toThrow('has option can not be used with getByPlaceholder, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByPlaceholder('list').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByPlaceholder, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByRole('list').has('#child'))
            .toThrow('has option can not be used with getByRole, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByRole('list').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByRole, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByTestId('title').has('#child'))
            .toThrow('has option can not be used with getByTestId, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByTestId('title').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByTestId, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByText('title').has('#child'))
            .toThrow('has option can not be used with getByText, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByText('title').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByText, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByTitle('title').has('#child'))
            .toThrow('has option can not be used with getByTitle, it can be used only with $ or new WebElement(\'#id\') syntax.');
        expect(() => $getByTitle('title').hasNot('#child'))
            .toThrow('hasNot option can not be used with getByTitle, it can be used only with $ or new WebElement(\'#id\') syntax.');
    })

    test(`get by role in chain generate correct selector`, async ({ page }) => {
        const table = $getByRole('table', { name: 'Users' })
            .subElements({
                row: $('tbody').$getByRole('row', { name: 'Something' })
            });
        await table.row.expect().toBeVisible();
    })

    test(`get by role in has condition generate correct selector`, async ({ page }) => {
        await $('div').has($getByRole('checkbox')).expect().toHaveCount(2);
    })

    test('and should extend locator with additional selectors list', async ({ page }) => {
        const element1 = $('input').and($('[id=checked]')).and('[checked]');
        const element2 = $('input[id=none]').and($('[type=checkbox]'));
        expect(await element1.isVisible()).toBe(true);
        expect(await element2.isVisible()).toBe(false);
    })

    test('or should extend locator with optional selectors list', async ({ page }) => {
        const element1 = $('[id=target]').or($('[type=notatype]'));
        const element2 = $('[id=nonetarget]').or($('[type=notatype]'));
        expect(await element1.isVisible()).toBe(true);
        expect(await element2.isVisible()).toBe(false);
    })

    test('area snapshot returns element html', async ({ page }) => {
        const element = $('[id=target]');
        expect(await element.ariaSnapshot()).toBe('- paragraph: This is visible target');
    })

});
