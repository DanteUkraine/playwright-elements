import { expect } from '../src';
import { test } from '../src';
import { $, WebElement, BrowserInstance, BrowserName } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test

test.describe('Web Element Edge Cases and Boundary Conditions', () => {

    test.beforeEach(async ({ goto }) => {
        await goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    test.describe('Deep Nesting Testing', () => {
        test('should handle very deep element chains (10 levels)', () => {
            let element: WebElement = $('html');
            for (let i = 0; i < 10; i++) {
                element = element.$('div');
            }
            
            expect(typeof element.selector).toBe('string');
            expect(element.parentElements).toHaveLength(10);
        });

        test('should handle very deep element chains (20 levels)', () => {
            let element: WebElement = $('html');
            for (let i = 0; i < 20; i++) {
                element = element.$('div');
            }
            
            expect(typeof element.selector).toBe('string');
            expect(element.parentElements).toHaveLength(20);
        });

        test('should handle nested subElements with deep chains', () => {
            const root = $('html')
                .subElements({
                    level1: $('body')
                        .subElements({
                            level2: $('div')
                                .subElements({
                                    level3: $('span')
                                        .subElements({
                                            level4: $('a')
                                        })
                                })
                        })
                });
            
            expect(root.level1.level2.level3.level4).toBeInstanceOf(WebElement);
            expect(root.level1.level2.level3.level4.narrowSelector).toBe('a');
        });
    });

    test.describe('Boundary Conditions Testing', () => {
        test('nth with very large index should work', () => {
            const element = $('div').nth(999999);
            expect(element._nth).toBe(999999);
            expect(element.count()).resolves.toBeLessThanOrEqual(1);
        });

        test('nth with negative index should work', () => {
            const element = $('div').nth(-10);
            expect(element._nth).toBe(-10);
        });

        test('nth with zero index should work', () => {
            const element = $('div').nth(0);
            expect(element._nth).toBe(0);
        });

        test('multiple chained nth calls should work', () => {
            const element = $('div').nth(1).nth(2).nth(3);
            expect(element._nth).toBe(3); // Last nth should override previous
        });

        test('has with string argument should point on element witch has specific child', async () => {
            const visibleElement = $(`#visible-target div`).has(`#right-target`);
            expect(visibleElement.selector).toBeTruthy();
        });

        test('hasText with WebElement argument should work', () => {
            const element = $(`li`).hasText('text');
            expect(element._hasText).toBe('text');
        });

        test('very long selector strings should be handled', () => {
            const longClassName = 'a'.repeat(1000);
            const element = $(`.${longClassName}`);
            expect(element.narrowSelector).toBe(`.${longClassName}`);
        });

        test('selector with many special characters should be handled', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:",.<>?/';
            const element = $(`div[data-test="${specialChars}"]`);
            expect(element.narrowSelector).toBe(`div[data-test="${specialChars}"]`);
        });

        test('Unicode characters in selectors should work', () => {
            const element = $('div[data-test="тест"]');
            expect(element.narrowSelector).toBe('div[data-test="тест"]');
        });

        test('Emoji in selectors should work', () => {
            const element = $('div[data-test="🚀🎯"]');
            expect(element.narrowSelector).toBe('div[data-test="🚀🎯"]');
        });
    });

    test.describe('Chaining Limits Testing', () => {
        test('multiple chained has methods should work', () => {
            const element = $('div')
                .has('#child1')
                .has('#child2')
                .has('#child3');
            
            expect(element._hasLocator).toBe('#child3'); // Last one should win
            expect(element._and).toHaveLength(0);
        });

        test('multiple chained hasNot methods should work', () => {
            const element = $('div')
                .hasNot('#exclude1')
                .hasNot('#exclude2')
                .hasNot('#exclude3');
            
            expect(element._hasNotLocator).toBe('#exclude3'); // Last one should win
        });

        test('multiple chained hasText methods should work', () => {
            const element = $('div')
                .hasText('text1')
                .hasText('text2')
                .hasText('text3');
            
            expect(element._hasText).toBe('text3'); // Last one should win
        });

        test('multiple chained hasNotText methods should work', () => {
            const element = $('div')
                .hasNotText('exclude1')
                .hasNotText('exclude2')
                .hasNotText('exclude3');
            
            expect(element._hasNotText).toBe('exclude3'); // Last one should win
        });

        test('complex chain with all filter types should work', () => {
            const element = $('div')
                .has('#child')
                .hasNot('#exclude')
                .hasText('include')
                .hasNotText('exclude')
                .nth(0)
                .and('#additional')
                .or('#alternative');
            
            expect(element._hasLocator).toBe('#child');
            expect(element._hasNotLocator).toBe('#exclude');
            expect(element._hasText).toBe('include');
            expect(element._hasNotText).toBe('exclude');
            expect(element._nth).toBe(0);
            expect(element._and).toHaveLength(1);
            expect(element._or).toHaveLength(1);
        });
    });

    test.describe('Regex Pattern Testing', () => {
        test('hasText with regex pattern should work', () => {
            const element = $('div').hasText(/\d+/);
            expect(element._hasText).toBeInstanceOf(RegExp);
        });

        test('hasNotText with regex pattern should work', () => {
            const element = $('div').hasNotText(/\d+/);
            expect(element._hasNotText).toBeInstanceOf(RegExp);
        });

        test('complex regex patterns should work', () => {
            const patterns = [
                /^test$/,
                /test/i,
                /test/g,
                /test/m,
                /[a-z]+/,
                /\d{3,5}/,
                /\w+@\w+\.\w+/
            ];
            
            for (const pattern of patterns) {
                const element = $('div').hasText(pattern);
                expect(element._hasText).toBe(pattern);
            }
        });

        test('regex with special characters should work', () => {
            const pattern = /test\.example\$\^\+\*/;
            const element = $('div').hasText(pattern);
            expect(element._hasText).toBe(pattern);
        });
    });

    test.describe('Array Operations Edge Cases', () => {
        test('getAll on element with many matches should work', async () => {
            const element = $('li'); // Should match multiple elements
            const all = await element.getAll();
            expect(Array.isArray(all)).toBe(true);
            expect(all.length).toBeGreaterThan(0);
        });

        test('asyncForEach with many elements should work', async () => {
            const element = $('li');
            let count = 0;
            await element.asyncForEach(() => { count++; });
            expect(count).toBeGreaterThan(0);
        });

        test('syncForEach with many elements should work', async () => {
            const element = $('li');
            let count = 0;
            await element.syncForEach(() => { count++; });
            expect(count).toBeGreaterThan(0);
        });

        test('map with transformation should work', async () => {
            const element = $('li');
            const result = await element.map(el => el.narrowSelector.toUpperCase());
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        test('filterElements with complex predicate should work', async () => {
            const element = $('li');
            const result = await element.filterElements(async el => {
                const text = await el.textContent();
                return text && text.includes('1');
            });
            expect(Array.isArray(result)).toBe(true);
        });
    });

    test.describe('Method Chaining Testing', () => {
        test('very long method chain should work', () => {
            const element = $('div')
                .hasText('test')
                .hasNotText('exclude')
                .has('#child')
                .hasNot('#exclude')
                .nth(0)
                .first()
                .last()
                .nth(1)
                .and('#additional')
                .or('#alternative');
            
            expect(element).toBeInstanceOf(WebElement);
            expect(element.narrowSelector).toBe('div');
        });

        test('chain with subElements and methods should work', () => {
            const element = $('div')
                .subElements({
                    child1: $('span'),
                    child2: $('a')
                })
                .withMethods({
                    customMethod: async () => 'custom'
                });
            
            expect(element).toHaveProperty('child1');
            expect(element).toHaveProperty('child2');
            expect(element).toHaveProperty('customMethod');
        });

        test('chain with all By selector types should work', () => {
            const element = $('div')
                .$getByAltText('alt')
                .$getByLabel('label')
                .$getByPlaceholder('placeholder')
                .$getByRole('button')
                .$getByTestId('test-id')
                .$getByText('text')
                .$getByTitle('title');
            
            expect(element).toBeInstanceOf(WebElement);
            // Check that the chain is built correctly
            expect(element.narrowSelector).toBe('title'); // Last one in chain
        });
    });

    test.describe('Clone and Immutability Testing', () => {
        test('clone should create independent copy', () => {
            const original = $('div').hasText('test');
            const clone = original.clone();
            
            // Modifying clone should not affect original
            (clone as any)._hasText = 'modified';
            expect(original._hasText).toBe('test');
        });

        test('multiple clones should be independent', () => {
            const original = $('div').hasText('test');
            const clone1 = original.clone();
            const clone2 = original.clone();
            
            (clone1 as any)._hasText = 'clone1';
            (clone2 as any)._hasText = 'clone2';
            
            expect(original._hasText).toBe('test');
            expect((clone1 as any)._hasText).toBe('clone1');
            expect((clone2 as any)._hasText).toBe('clone2');
        });

        test('clone with overrides should not affect original', () => {
            const original = $('div').hasText('test').nth(0);
            const clone = original.clone({ hasText: 'new', nth: 1 });
            
            expect(original._hasText).toBe('test');
            expect(original._nth).toBe(0);
            expect(clone._hasText).toBe('new');
            expect(clone._nth).toBe(1);
        });

        test('subElements should create independent elements', () => {
            const parent1 = $('div');
            
            parent1.subElements({
                child: $('a')
            });
            
            // The child should have parent1 as parent
            const child = (parent1 as any).child;
            expect(child.parent()).toEqual(parent1);
        });
    });

    test.describe('Special Character and Encoding Testing', () => {
        test('whitespace in selectors should work', () => {
            const element = $('div[ data-test = "value" ]');
            expect(element.narrowSelector).toBe('div[ data-test = "value" ]');
        });

        test('newlines in selectors should work', () => {
            const element = $('div\nspan');
            expect(element.narrowSelector).toBe('div\nspan');
        });

        test('tabs in selectors should work', () => {
            const element = $('div\tspan');
            expect(element.narrowSelector).toBe('div\tspan');
        });

        test('quoted selectors should work', () => {
            const element = $('"div span"');
            expect(element.narrowSelector).toBe('"div span"');
        });

        test('CSS escape sequences should work', () => {
            const element = $('#test\\:id');
            expect(element.narrowSelector).toBe('#test\\:id');
        });
    });
});
