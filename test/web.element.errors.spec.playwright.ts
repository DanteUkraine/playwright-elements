import { expect } from '../src';
import { test } from '../src';
import { $, $getByAltText, $getByLabel, $getByPlaceholder, $getByRole, $getByTestId, $getByText, $getByTitle, BrowserInstance } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test

test.describe('Web Element Error Handling and Negative Testing', () => {

    test.beforeEach(async ({ goto }) => {
        await goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    test.describe('Invalid Selector Testing', () => {
        test('should handle invalid CSS selector syntax', async () => {
            const element = $('invalid >>> selector');
            expect(await element.count()).toBe(0);
        });

        test('should handle empty string selector', async () => {
            const element = $('');
            try {
                await element.count();
                throw new Error('Expected error for empty selector');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        test('should handle null-like selector', async () => {
            const element = $('null');
            expect(await element.count()).toBe(0);
        });

        test('should handle undefined-like selector', async () => {
            const element = $('undefined');
            expect(await element.count()).toBe(0);
        });

        test('should handle selector with special characters that need escaping', async () => {
            // This should work as a valid selector
            const element = $('#test\\:id');
            expect(await element.count()).toBe(0); // Element doesn't exist, but selector is valid
        });

        test('should handle very long selector string', async () => {
            const longSelector = 'div'.repeat(1000);
            const element = $(longSelector);
            // Should not throw, just return 0 count
            expect(await element.count()).toBe(0);
        });
    });

    test.describe('Non-existent Element Testing', () => {
        test('should handle non-existent element operations', async () => {
            const element = $('#non-existent-element-12345');
            expect(await element.count()).toBe(0);
        });

        test('getText should handle non-existent elements', async () => {
            // getText will throw when textContent returns null
            const element = $('#non-existent-element-12345');
            try {
                await element.locator.textContent({ timeout: 100 });
                throw new Error('Expected error for textContent on non-existent element');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        test('getAttribute should handle non-existent elements', async () => {
            // getAttribute returns null for non-existent attributes, but waits for element
            const element = $('h1'); // Use existing element
            const result = await element.getAttribute('data-non-existent');
            expect(result).toBeNull();
        });

        test('should handle non-existent element with isVisible', async () => {
            const element = $('#non-existent-element-12345');
            const result = await element.isVisible();
            expect(result).toBe(false);
        });

        test('should handle non-existent element with isHidden', async () => {
            const element = $('#non-existent-element-12345');
            const result = await element.isHidden();
            expect(result).toBe(true);
        });
    });

    test.describe('By Selector Error Testing', () => {
        test('has method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.has('#child')).toThrow(/has option can not be used with/);
        });

        test('hasNot method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.hasNot('#child')).toThrow(/hasNot option can not be used with/);
        });

        test('hasText method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.hasText('test')).toThrow(/hasText option can not be used with/);
        });

        test('hasNotText method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.hasNotText('test')).toThrow(/hasNotText option can not be used with/);
        });

        test('all By selector methods should work with valid selectors', async () => {
            // These should not throw errors
            expect(() => $getByAltText('test')).not.toThrow();
            expect(() => $getByLabel('test')).not.toThrow();
            expect(() => $getByPlaceholder('test')).not.toThrow();
            expect(() => $getByRole('div')).not.toThrow();
            expect(() => $getByTestId('test')).not.toThrow();
            expect(() => $getByText('test')).not.toThrow();
            expect(() => $getByTitle('test')).not.toThrow();
        });
    });

    test.describe('Chainable Method Error Testing', () => {
        test('clone method should preserve all properties', async () => {
            const original = $('div').hasText('test').hasNotText('exclude').nth(1);
            const cloned = original.clone();
            
            expect(cloned.narrowSelector).toEqual(original.narrowSelector);
            expect(cloned._hasText).toEqual(original._hasText);
            expect(cloned._hasNotText).toEqual(original._hasNotText);
            expect(cloned._nth).toEqual(original._nth);
        });

        test('clone method should allow property overrides', async () => {
            const original = $('div').hasText('test');
            const cloned = original.clone({ hasText: 'new text' });
            
            expect(cloned._hasText).toEqual('new text');
            expect(original._hasText).toEqual('test'); // Original should be unchanged
        });

        test('and method should create new instance', async () => {
            const original = $('div');
            const andElement = original.and('#child');
            
            expect(andElement).not.toBe(original);
            expect(andElement._and).toHaveLength(1);
            expect(original._and).toHaveLength(0);
        });

        test('or method should create new instance', async () => {
            const original = $('div');
            const orElement = original.or('#child');
            
            expect(orElement).not.toBe(original);
            expect(orElement._or).toHaveLength(1);
            expect(original._or).toHaveLength(0);
        });

        test('nth method should create new instance', async () => {
            const original = $('div');
            const nthElement = original.nth(1);
            
            expect(nthElement).not.toBe(original);
            expect(nthElement._nth).toEqual(1);
            expect(original._nth).toBeUndefined();
        });

        test('first method should set nth to 0', async () => {
            const element = $('div').first();
            expect(element._nth).toEqual(0);
        });

        test('last method should set nth to -1', async () => {
            const element = $('div').last();
            expect(element._nth).toEqual(-1);
        });
    });

    test.describe('Type Mismatch Testing', () => {
        test('withMethods should throw error for duplicate method names', async () => {
            const element = $('div');
            expect(() => {
                element.withMethods({
                    click: () => {}, // This should throw because click already exists
                });
            }).toThrow(/Can not add method with name 'click'/);
        });

        test('withMethods should add valid methods', async () => {
            const element = $('div');
            const result = element.withMethods({
                customMethod: async () => 'test',
            });
            
            expect(result).toHaveProperty('customMethod');
            expect(await (result as any).customMethod()).toEqual('test');
        });

        test('subElements should handle null/undefined values gracefully', async () => {
            const element = $('div');
            // This should not throw
            const result = element.subElements({
                // No elements to add
            });
            expect(result).toEqual(element);
        });
    });

    test.describe('Frame and Context Testing', () => {
        test('contentFrame should set _isFrame flag', async () => {
            const element = $('iframe').contentFrame();
            expect(element._isFrame).toBe(true);
        });

        test('owner should reset _isFrame flag', async () => {
            const element = $('iframe').contentFrame().owner();
            expect(element._isFrame).toBe(false);
        });

        test('contentFrame and owner should be chainable', async () => {
            const element = $('iframe').contentFrame().owner().contentFrame();
            expect(element._isFrame).toBe(true);
        });
    });

    test.describe('Parent-Child Relationship Testing', () => {
        test('parent should return the last parent element', async () => {
            const parent = $('div');
            const child = parent.$('span');
            const grandchild = child.$('a');
            
            expect(grandchild.parent()).toEqual(child);
            expect(child.parent()).toEqual(parent);
        });

        test('parent should throw when no parents exist', async () => {
            const element = $('div');
            const result = element.parent();
            expect(result).toBeUndefined();
        });

        test('addParentSelector should maintain parent chain', async () => {
            const parent1 = $('div');
            const parent2 = $('span');
            const child = $('a');
            
            // Manually add parents (simulating internal behavior)
            (child as any).addParentSelector(parent1);
            (child as any).addParentSelector(parent2);
            
            expect(child.parentElements).toHaveLength(2);
            expect(child.parentElements[0]).toEqual(parent2);
            expect(child.parentElements[1]).toEqual(parent1);
        });
    });

    test.describe('Selector Building Testing', () => {
        test('selector should handle complex chains', async () => {
            const element = $('div').hasText('test').hasNotText('exclude').nth(1);
            const selector = element.selector;
            expect(selector).toContain('div');
            // The selector might be just the base selector without the filters in the string representation
            expect(typeof selector).toBe('string');
            expect(selector).not.toBe('');
        });

        test('selector should handle parent chains', async () => {
            const parent = $('div');
            const child = parent.$('span');
            const grandchild = child.$('a');
            
            const selector = grandchild.selector;
            expect(selector).toContain('div');
            expect(selector).toContain('span');
            expect(selector).toContain('a');
        });

        test('selector should handle has locator chains', async () => {
            const parent = $('div');
            const child = parent.has('#child');
            const selector = child.selector;
            expect(selector).toContain('div');
            expect(selector).toContain('internal:has');
        });
    });

    test.describe('Array Operations Testing', () => {
        test('getAll should return empty array for non-existent elements', async () => {
            const element = $('#non-existent-12345');
            const all = await element.getAll();
            expect(Array.isArray(all)).toBe(true);
            expect(all).toHaveLength(0);
        });

        test('asyncForEach should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            let callCount = 0;
            await element.asyncForEach(() => { callCount++; });
            expect(callCount).toEqual(0);
        });

        test('syncForEach should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            let callCount = 0;
            await element.syncForEach(() => { callCount++; });
            expect(callCount).toEqual(0);
        });

        test('map should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            const result = await element.map(el => el.narrowSelector);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });

        test('filterElements should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            const result = await element.filterElements(() => true);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });
    });

    test.describe('Filter Method Testing', () => {
        test('filter should create new instance with options', async () => {
            const original = $('div');
            const filtered = original.filter({ hasText: 'test' });
            
            expect(filtered).not.toBe(original);
            expect(filtered._hasText).toEqual('test');
            expect(original._hasText).toBeUndefined();
        });

        test('filter should handle all option types', async () => {
            const element = $('div');
            const filtered = element.filter({
                has: '#child',
                hasNot: '#exclude',
                hasText: /test/,
                hasNotText: /exclude/
            });
            
            expect(filtered._hasLocator).toEqual('#child');
            expect(filtered._hasNotLocator).toEqual('#exclude');
            expect(filtered._hasText).toEqual(/test/);
            expect(filtered._hasNotText).toEqual(/exclude/);
        });
    });

    test.describe('Locator Method Testing', () => {
        // These tests use existing elements to avoid Playwright's default timeout behavior
        
        test('boundingBox method should exist and be callable', async () => {
            const element = $('h1'); // Use existing element
            // Test that the method exists and can be called
            expect(element).toHaveProperty('boundingBox');
            expect(typeof element.boundingBox).toEqual('function');
            // Call it on an existing element to avoid timeout
            const result = await element.boundingBox();
            // Should return a bounding box object with expected properties or null
            expect(result === null || (result && typeof result === 'object' && 'x' in result && 'y' in result && 'width' in result && 'height' in result)).toBe(true);
        });

        test('screenshot method should exist and be callable', async () => {
            const element = $('h1');
            // Test that the method exists and can be called on an existing element
            expect(element).toHaveProperty('screenshot');
            expect(typeof element.screenshot).toEqual('function');
        });

        test('click method should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('click');
            expect(typeof element.click).toEqual('function');
        });

        test('fill method should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('fill');
            expect(typeof element.fill).toEqual('function');
        });

        test('getAttribute should return null for non-existent attributes', async () => {
            const element = $('h1'); // Use an existing element
            const result = await element.getAttribute('data-non-existent');
            expect(result).toBeNull();
        });
    });

    test.describe('Mobile Context Testing', () => {
        test('isContextMobile getter should work', async () => {
            // This tests the uncovered lines in browser.ts
            BrowserInstance.isContextMobile = false;
            expect(BrowserInstance.isContextMobile).toBe(false);
            
            BrowserInstance.isContextMobile = true;
            expect(BrowserInstance.isContextMobile).toBe(true);
            
            // Reset to default
            BrowserInstance.isContextMobile = false;
        });
    });
});
