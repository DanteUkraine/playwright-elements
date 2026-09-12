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


test.describe(`Web element build in selectors`, () => {

    test.beforeEach(async ({ goto, page }) => {
        await goto(localFilePath);
        await page.locator('h1').waitFor();
    })

    test(`getByText for string should point on origin element`, async () => {
        const visibleElement = $(`*css=#visible-target`).$getByText('visible target');
        await expect(visibleElement.locator).toHaveAttribute('id', 'visible-target');
    })

    test(`getByText for string should point on sub element`, async () => {
        const visibleElement = $(`#visible-target`).$getByText('is visible target');
        await expect(visibleElement.locator).toHaveAttribute('id', 'target');
    })

    test(`first should point on first element`, async () => {
        const visibleElement = $(`li`).first();
        await expect(visibleElement.locator).toHaveText('1');
    })

    test(`last should point on last element`, async () => {
        const visibleElement = $(`li`).last();
        await expect(visibleElement.locator).toHaveText('text');
    })

    test(`nth should point on element by index element`, async () => {
        const visibleElement = $(`li`).nth(3);
        await expect(visibleElement.locator).toHaveText('4');
    })

    test(`has with string argument should point on element witch has specific child`, async () => {
        const visibleElement = $(`#visible-target div`).has(`#right-target`);
        await expect(visibleElement.locator).toHaveAttribute('id', 'inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child`, async () => {
        const visibleElement = $(`#visible-target div`).has($(`#right-target`));
        await expect(visibleElement.locator).toHaveAttribute('id', 'inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child with specific text`, async () => {
        const visibleElement = $(`#visible-target div`).has($('p').hasText('Visible target'));
        await expect(visibleElement.locator).toHaveAttribute('id', 'inner-visible-target2');
    })

    test(`has with WebElement argument should point on element witch has specific child with specific text and common parent`, async () => {
        const testElement = $('[data-testid=test-div]').subElements({
            visibleElement: $(`#visible-target div`).has($('p').hasText('Visible target'))
        });
        await expect(testElement.visibleElement.locator).toHaveAttribute('id', 'inner-visible-target2');
    })

    test(`hasText with WebElement argument should point on element witch has specific text`, async () => {
        const element = $(`li`).hasText('text');
        await expect(element.locator).toHaveCount(1);
    })

    test(`hasText with WebElement argument should point on element witch has specific child with text`, async () => {
        const element = $(`ul`).hasText('text');
        await expect(element.$('li').locator).toHaveCount(7);
    })

    test(`has with sub elements argument should point on element witch has specific parent`, async () => {
        const visibleElement = $(`#visible-target div`)
            .subElements({
                paragraph: $(`p[hidden]`)
            });
        expect(visibleElement.has($('#right-target')).first().selector).toBe('#visible-target div >> internal:has="#right-target"');
        await expect(visibleElement.has('#right-target').paragraph.locator).toHaveText('This is hidden right target');
    })

    test(`get by alt text selector method`, async () => {
        await expect($getByAltText('alt text').locator).toHaveAttribute('alt', 'This is the alt text');
        await expect($('body').$getByAltText('alt text').locator).toHaveAttribute('alt', 'This is the alt text');
    })

    test(`get by label selector method`, async () => {
        await expect($getByLabel('Checked box', { exact: true }).locator).toHaveAttribute('id', 'checked');
        
        const result = await $getByLabel('Checked box').map(el => el.getAttribute('id'));
        expect(result).toContain('checked');
        expect(result).toContain('unchecked');
        
        await expect($('body').$getByLabel('Checked box', { exact: true }).locator).toHaveAttribute('id', 'checked');
        
        const result2 = await $('body').$getByLabel('Checked box').map(el => el.getAttribute('id'));
        expect(result2).toContain('checked');
        expect(result2).toContain('unchecked');
    })

    test(`get by placeholder selector method`, async () => {
        const element = $('fieldset').subElements({ input: $getByPlaceholder('enabled') });
        await expect(element.input.locator).toHaveAttribute('id', 'enabled-field');
    })

    test(`get by role selector method`, async () => {
        const elements = $getByRole('list');
        await expect(elements.locator).toHaveCount(2);
    })

    test(`get by test id selector method`, async () => {
        const element = $getByTestId('main-title');
        await expect(element.locator).toHaveText('Hello Playwright elements');
    })

    test(`get by text selector method`, async () => {
        const element = $getByText('Hello Playwright');
        await expect(element.locator).toHaveText('Hello Playwright elements');
    })

    test(`get by title selector method`, async () => {
        const element = $getByTitle('Submit button');
        await expect(element.locator).toHaveText('Button');
    })

    test(`get by with direct child plus has`, async () => {
        const element = $getByTestId('test-div').$('div')
            .subElements({
                p: $('p')
            })
        await expect(element.has('#inner-visible-target').p.$getByText('Second visible target').locator).toBeVisible();
    })

    test(`get by selector methods should not be used with has or hasNot methods`, async () => {
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

    test(`get by role in chain generate correct selector`, async () => {
        const table = $getByRole('table', { name: 'Users' })
            .subElements({
                row: $('tbody').$getByRole('row', { name: 'Something' })
            });
        await expect(table.row.locator).toBeVisible();
    })

    test(`get by role in has condition generate correct selector`, async () => {
        await expect($('div').has($getByRole('checkbox')).locator).toHaveCount(2);
    })

    test('and should extend locator with additional selectors list', async () => {
        const element1 = $('input').and($('[id=checked]')).and('[checked]');
        const element2 = $('input[id=none]').and($('[type=checkbox]'));
        await expect(element1.locator).toBeVisible();
        await expect(element2.locator).toBeHidden();
    })

    test('or should extend locator with optional selectors list', async () => {
        const element1 = $('[id=target]').or($('[type=notatype]'));
        const element2 = $('[id=nonetarget]').or($('[type=notatype]'));
        await expect(element1.locator).toBeVisible();
        await expect(element2.locator).toBeHidden();
    })

    test('area snapshot returns element html', async () => {
        const element = $('[id=target]');
        expect(await element.ariaSnapshot()).toBe('- paragraph: This is visible target');
    })

});
