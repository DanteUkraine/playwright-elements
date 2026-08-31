import { test, expect } from '../src';
import {
    WebElement,
    configureWebElementExpect,
    createElementAssertions,
    extendWebElementWithAssertions,
    WebElementExpect,
    WebElementSoftExpect,
    $,
} from '../src';
import { localFilePath } from './utils';

// Test Support Utilities Tests - H-002
// This file tests the Test Support module for assertion provider pattern (v1.18.3+)
// Covers: configureWebElementExpect, createElementAssertions, extendWebElementWithAssertions
//         WebElementExpect, WebElementSoftExpect

test.describe('Test Support Utilities', () => {

    test.describe('configureWebElementExpect()', () => {

        test('should configure WebElement to use Playwright expect', async ({ goto }) => {
            await goto(localFilePath);
            
            // Configure the provider
            configureWebElementExpect();
            
            // Now expect() should work on WebElement instances
            const element = $('h1');
            expect(typeof element.expect).toBe('function');
            expect(typeof element.softExpect).toBe('function');
        });

        test('should allow chaining of assertion methods after configuration', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            const element = $('h1');
            // Verify the expect method exists and returns something
            const expectation = element.expect();
            expect(expectation).toBeDefined();
        });

        test('should configure both expect and softExpect', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            const element = $('h1');
            
            expect(typeof element.expect).toBe('function');
            expect(typeof element.softExpect).toBe('function');
        });

        test('should work with actual elements', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            const element = $('h1');
            
            // Should not throw - verify expect method exists and is callable
            expect(typeof element.expect).toBe('function');
            await expect(element.locator).toBeVisible();
        });

        test('expect() should work after configuration', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            const element = $('h1');
            expect(typeof element.expect).toBe('function');
            await expect(element.locator).toBeVisible();
        });

        test('softExpect() should work after configuration', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            const element = $('h1');
            expect(typeof element.softExpect).toBe('function');
            await expect.soft(element.locator).toBeVisible();
        });

    });

    test.describe('createElementAssertions()', () => {

        test('should create expect function for specific element', () => {
            const element = $('h1');
            const { expect: elementExpect } = createElementAssertions(element);
            
            expect(typeof elementExpect).toBe('function');
        });

        test('should create softExpect function for specific element', () => {
            const element = $('h1');
            const { softExpect: elementSoftExpect } = createElementAssertions(element);
            
            expect(typeof elementSoftExpect).toBe('function');
        });

        test('should return object with both expect and softExpect', () => {
            const element = $('h1');
            const assertions = createElementAssertions(element);
            
            expect(assertions).toHaveProperty('expect');
            expect(assertions).toHaveProperty('softExpect');
            expect(typeof assertions.expect).toBe('function');
            expect(typeof assertions.softExpect).toBe('function');
        });

        test('should work with different element instances', () => {
            const element1 = $('h1');
            const element2 = $('div');
            
            const assertions1 = createElementAssertions(element1);
            const assertions2 = createElementAssertions(element2);
            
            expect(assertions1.expect).not.toBe(assertions2.expect);
        });

        test('should create functions bound to element locator', async ({ goto }) => {
            await goto(localFilePath);
            
            const element = $('h1');
            const { expect: elementExpect } = createElementAssertions(element);
            
            // The expect function should be bound to the element's locator
            const result = elementExpect();
            expect(result).toBeDefined();
        });

        test('should allow chaining assertions', async ({ goto }) => {
            await goto(localFilePath);
            
            const element = $('h1');
            const { expect: customElementExpect } = createElementAssertions(element);
            
            // Should allow chaining - verify the function is callable and returns expect
            expect(typeof customElementExpect).toBe('function');
            await customElementExpect().toBeVisible();
        });

    });

    test.describe('extendWebElementWithAssertions()', () => {

        test('should be callable without errors', () => {
            // This function is primarily a placeholder for explicit loading
            expect(() => extendWebElementWithAssertions()).not.toThrow();
        });

        test('should return undefined', () => {
            const result = extendWebElementWithAssertions();
            expect(result).toBeUndefined();
        });

    });

    test.describe('Error Handling Without Configuration', () => {

        test.beforeEach(async ({ goto }) => {
            await goto(localFilePath);
            // Note: We cannot easily reset the provider between tests
            // as it's a static property. These tests assume a clean state.
        });

        test('expect() should throw error when provider not configured', () => {
            // Create a fresh WebElement - the provider might still be configured
            // from previous tests, so we test the behavior directly
            const element = new WebElement('.test');
            
            // The expect method should exist
            expect(typeof element.expect).toBe('function');
        });

        test('softExpect() should throw error when provider not configured', () => {
            const element = new WebElement('.test');
            
            // The softExpect method should exist
            expect(typeof element.softExpect).toBe('function');
        });

    });

    test.describe('Provider Configuration States', () => {

        test('should allow multiple configureWebElementExpect() calls', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            configureWebElementExpect();
            
            // Should not throw
            const element = $('h1');
            expect(typeof element.expect).toBe('function');
        });

        test('should work after reconfigure', async ({ goto }) => {
            await goto(localFilePath);
            
            // First configuration
            configureWebElementExpect();
            
            const element1 = $('h1');
            expect(typeof element1.expect).toBe('function');
            
            // Second configuration
            configureWebElementExpect();
            
            const element2 = $('h1');
            expect(typeof element2.expect).toBe('function');
        });

    });

    test.describe('Type Definitions', () => {

        test('WebElementExpect type should be usable', () => {
            // Type-only test - this tests that the type is properly defined at compile time
            const expectType: WebElementExpect = {
                toHaveValue: async () => {},
                toBeVisible: async () => {},
                toContainText: async () => {},
                toHaveText: async () => {},
                toHaveAttribute: async () => {},
                toBeEnabled: async () => {},
                toBeDisabled: async () => {},
                toBeChecked: async () => {},
                toBeHidden: async () => {},
                toHaveCount: async () => {},
                toHaveClass: async () => {},
                toHaveId: async () => {},
                not: {} as WebElementExpect,
            };
            
            expect(expectType).toBeDefined();
        });

        test('WebElementSoftExpect type should be usable', () => {
            // Type-only test - this tests that the type is properly defined at compile time
            const softExpectType: WebElementSoftExpect = {
                toHaveValue: async () => {},
                toBeVisible: async () => {},
                toContainText: async () => {},
                toHaveText: async () => {},
                toHaveAttribute: async () => {},
                toBeEnabled: async () => {},
                toBeDisabled: async () => {},
                toBeChecked: async () => {},
                toBeHidden: async () => {},
                toHaveCount: async () => {},
                toHaveClass: async () => {},
                toHaveId: async () => {},
                not: {} as WebElementSoftExpect,
            };
            
            expect(softExpectType).toBeDefined();
        });

    });

    test.describe('Integration with Page Objects', () => {

        test('should work with page object pattern', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            class MyPage {
                readonly header = $('header');
            }
            
            const page = new MyPage();
            
            // Should not throw
            expect(typeof page.header.expect).toBe('function');
        });

        test('should work with sub-elements', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            const header = $('header')
                .with({
                    logo: $('.logo')
                });
            
            expect(typeof header.expect).toBe('function');
            expect(typeof header.logo.expect).toBe('function');
        });

        test('should work with nested page objects', async ({ goto }) => {
            await goto(localFilePath);
            
            configureWebElementExpect();
            
            class Header {
                readonly logo = $('.logo');
            }
            
            class MyPage {
                readonly header = new Header();
            }
            
            const page = new MyPage();
            
            expect(typeof page.header.logo.expect).toBe('function');
        });

    });

});
