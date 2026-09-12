import { test, expect } from '../src';
import {
    TestId,
    sid,
    factory,
    bareFactory,
    testIdProps,
    isIdFactory,
    $byTestId,
    $byTestIdPrefix,
    $byTestIdContaining,
    $byTestIdEndingWith,
} from '../src';
import { localFilePath } from './utils';

test.describe('Test IDs Module', () => {

    test.describe('sid() - Static ID Builder', () => {

        test('should create static ID from single string part', () => {
            const id = sid('submit-button');
            expect(id).toBe('submit-button');
        });

        test('should create static ID from multiple string parts', () => {
            const id = sid('user', 'profile', 'link');
            expect(id).toBe('user-profile-link');
        });

        test('should create static ID from string and number parts', () => {
            const id = sid('user', 123, 'profile');
            expect(id).toBe('user-123-profile');
        });

        test('should filter out null and undefined parts', () => {
            const id = sid('user', null, undefined, 'profile');
            expect(id).toBe('user-profile');
        });

        test('should filter out empty string parts', () => {
            const id = sid('user', '', 'profile');
            expect(id).toBe('user-profile');
        });

        test('should throw error for all null/undefined/empty parts', () => {
            expect(() => sid(null, undefined, '')).toThrow('[playwright-elements] sid() needs at least one part');
        });

        test('should create typed TestId', () => {
            const id: TestId<'button'> = sid('submit-button');
            expect(id).toBe('submit-button');
        });

    });

    test.describe('factory() - ID Factory with Prefix', () => {

        test('should create factory with prefix', () => {
            const btn = factory('btn');
            expect(btn.prefix).toBe('btn');
        });

        test('should create IDs with prefix', () => {
            const btn = factory('btn');
            expect(btn('submit')).toBe('btn-submit');
            expect(btn('cancel')).toBe('btn-cancel');
        });

        test('should create IDs with numbers', () => {
            const btn = factory('btn');
            expect(btn(123)).toBe('btn-123');
        });

        test('should create typed factory', () => {
            const ruleAction = factory<'rules.rowAction'>('rule-action');
            const id: TestId<'rules.rowAction'> = ruleAction('edit');
            expect(id).toBe('rule-action-edit');
        });

        test('should create factory with alias prefixes', () => {
            const nudgeButton = factory('nudge-button', {
                aliasPrefixes: ['nudge-button']
            });
            expect(nudgeButton.prefix).toBe('nudge-button');
            expect(nudgeButton.aliasPrefixes).toEqual(['nudge-button']);
        });

        test('should create factory without alias prefixes', () => {
            const simple = factory('simple');
            expect(simple.aliasPrefixes).toBeUndefined();
        });

    });

    test.describe('bareFactory() - Factory without Prefix', () => {

        test('should create factory with empty prefix', () => {
            const ruleRow = bareFactory<'rules.row'>();
            expect(ruleRow.prefix).toBe('');
        });

        test('should create IDs equal to key', () => {
            const ruleRow = bareFactory<'rules.row'>();
            expect(ruleRow(123)).toBe('123');
            expect(ruleRow('abc')).toBe('abc');
        });

        test('should create typed factory', () => {
            const ruleRow = bareFactory<'rules.row'>();
            const id: TestId<'rules.row'> = ruleRow('123');
            expect(id).toBe('123');
        });

    });

    test.describe('testIdProps() - React Props Helper', () => {

        test('should return object with data-testid property', () => {
            const props = testIdProps('my-id');
            expect(props).toEqual({ 'data-testid': 'my-id' });
        });

        test('should work with string IDs', () => {
            const props = testIdProps('submit-button');
            expect(props['data-testid']).toBe('submit-button');
        });

        test('should work with TestId type', () => {
            const id = sid('my-button');
            const props = testIdProps(id);
            expect(props['data-testid']).toBe('my-button');
        });

        test('should work with factory-generated IDs', () => {
            const btn = factory('btn');
            const props = testIdProps(btn('submit'));
            expect(props['data-testid']).toBe('btn-submit');
        });

    });

    test.describe('isIdFactory() - Type Guard', () => {

        test('should return true for factory instances', () => {
            const btn = factory('btn');
            expect(isIdFactory(btn)).toBe(true);
        });

        test('should return true for bareFactory instances', () => {
            const ruleRow = bareFactory();
            expect(isIdFactory(ruleRow)).toBe(true);
        });

        test('should return false for non-functions', () => {
            expect(isIdFactory(null)).toBe(false);
            expect(isIdFactory(undefined)).toBe(false);
            expect(isIdFactory({})).toBe(false);
            expect(isIdFactory('string')).toBe(false);
            expect(isIdFactory(123)).toBe(false);
        });

        test('should return false for regular functions', () => {
            const regularFn = () => 'test';
            expect(isIdFactory(regularFn)).toBe(false);
        });

        test('should return false for objects without prefix', () => {
            const obj = { prefix: 'test' };
            expect(isIdFactory(obj)).toBe(false);
        });

    });

    test.describe('TestId Type', () => {

        test('should be assignable to string', () => {
            const id: TestId<'button'> = sid('submit');
            const str: string = id;
            expect(str).toBe('submit');
        });

        test('should allow different kind types to be distinct', () => {
            type ButtonId = TestId<'button'>;
            type ContainerId = TestId<'container'>;
            
            const buttonId: ButtonId = sid('submit');
            const containerId: ContainerId = sid('main');
            
            // These should be different types
            expect(buttonId).toBe('submit');
            expect(containerId).toBe('main');
        });

    });

    test.describe('$byTestId() - Exact Match Selector', () => {

        test.beforeEach(async ({ goto }) => {
            await goto(localFilePath);
        });

        test('should create WebElement with CSS attribute selector', () => {
            const element = $byTestId('main-title');
            expect(element.selector).toBe('[data-testid="main-title"]');
        });

        test('should work with string ID', () => {
            const element = $byTestId('main-title');
            expect(element.narrowSelector).toBe('[data-testid="main-title"]');
        });

        test('should work with TestId type', () => {
            const id = sid<'header'>('main-title');
            const element = $byTestId(id);
            expect(element.selector).toBe('[data-testid="main-title"]');
        });

        test('should match element with exact data-testid', async () => {
            const element = $byTestId('main-title');
            await element.expect().toBeVisible();
            const text = await element.textContent();
            expect(text).toContain('Hello Playwright');
        });

    });

    test.describe('$byTestIdPrefix() - Prefix Match Selector', () => {

        test.beforeEach(async ({ goto }) => {
            await goto(localFilePath);
        });

        test('should create WebElement with prefix selector', () => {
            const ruleRow = factory<'rules.row'>('test');
            const element = $byTestIdPrefix(ruleRow);
            expect(element.selector).toBe('[data-testid^="test-"]');
        });

        test('should match elements starting with prefix and delimiter', async ({ page }) => {
            // Add elements with test-div-* IDs (note the - delimiter)
            await page.evaluate(() => {
                const div = document.createElement('div');
                div.setAttribute('data-testid', 'test-div-1');
                document.body.appendChild(div);
                const div2 = document.createElement('div');
                div2.setAttribute('data-testid', 'test-div-2');
                document.body.appendChild(div2);
            });
            
            const ruleRow = factory('test-div');
            const element = $byTestIdPrefix(ruleRow);
            // Should only match elements with the prefix + delimiter, not static 'test-div'
            await expect(element.locator).toHaveCount(2); // test-div-1 and test-div-2
        });

        test('should throw error for factory with empty prefix', () => {
            const bare = bareFactory();
            expect(() => $byTestIdPrefix(bare)).toThrow('requires a factory with a non-empty prefix');
        });

    });

    test.describe('$byTestIdContaining() - Contains Match Selector', () => {

        test.beforeEach(async ({ goto }) => {
            await goto(localFilePath);
        });

        test('should create WebElement with contains selector', () => {
            const element = $byTestIdContaining('title');
            expect(element.selector).toBe('[data-testid*="title"]');
        });

        test('should match elements containing substring', async () => {
            const element = $byTestIdContaining('main');
            await expect(element.locator).toHaveCount(1); // main-title
        });

    });

    test.describe('$byTestIdEndingWith() - Ends With Match Selector', () => {

        test.beforeEach(async ({ goto }) => {
            await goto(localFilePath);
        });

        test('should create WebElement with ends with selector', () => {
            const element = $byTestIdEndingWith('-title');
            expect(element.selector).toBe('[data-testid$="-title"]');
        });

        test('should match elements ending with suffix', async () => {
            const element = $byTestIdEndingWith('-title');
            await expect(element.locator).toHaveCount(1); // main-title
        });

    });

    test.describe('Integration Scenarios', () => {

        test.beforeEach(async ({ goto }) => {
            await goto(localFilePath);
        });

        test('should work with page object pattern using Test IDs', async () => {
            // Define test IDs
            const ids = {
                header: {
                    title: sid<'header.title'>('main-title'),
                }
            } as const;

            // Create page object
            const pageObject = {
                header: {
                    title: $byTestId(ids.header.title)
                }
            };

            // Use in test
            await expect(pageObject.header.title.locator).toBeVisible();
        });

        test('should work with factory in page objects', async () => {
            const button = factory<'button'>('btn');
            
            const pageObject = {
                buttons: {
                    submit: $byTestId(button('submit')),
                    cancel: $byTestId(button('cancel'))
                }
            };

            // These won't match as the elements don't exist in test.html
            // but we can verify the selectors are correct
            expect(pageObject.buttons.submit.selector).toBe('[data-testid="btn-submit"]');
            expect(pageObject.buttons.cancel.selector).toBe('[data-testid="btn-cancel"]');
        });

        test('should combine with other WebElement methods', () => {
            const element = $byTestId('main-title').first();
            expect(element.selector).toContain('[data-testid="main-title"]');
        });

        test('should support chaining with subElements', () => {
            const element = $byTestId('test-div')
                .subElements({
                    child: $byTestId('main-title')
                });
            
            // The child selector should include the parent's selector
            expect(element.child.selector).toBe('[data-testid="test-div"] >> [data-testid="main-title"]');
        });

    });

});
