import { expect } from 'chai';
import { test } from 'mocha';
import { $, WebElement, BrowserInstance, BrowserName } from '../src';
import { localFilePath } from './utils';

describe('Web Element Edge Cases and Boundary Conditions', function () {
    this.timeout(10_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    });

    after(async () => {
        await BrowserInstance.close();
    });

    describe('Deep Nesting Testing', () => {
        test('should handle very deep element chains (10 levels)', async () => {
            let element: WebElement = $('html');
            for (let i = 0; i < 10; i++) {
                element = element.$('div');
            }
            
            expect(element.selector).to.be.a('string');
            expect(element.parentElements).to.have.lengthOf(10);
        });

        test('should handle very deep element chains (20 levels)', async () => {
            let element: WebElement = $('html');
            for (let i = 0; i < 20; i++) {
                element = element.$('div');
            }
            
            expect(element.selector).to.be.a('string');
            expect(element.parentElements).to.have.lengthOf(20);
        });

        test('should handle nested subElements with deep chains', async () => {
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
            
            expect(root.level1.level2.level3.level4).to.be.instanceOf(WebElement);
            expect(root.level1.level2.level3.level4.narrowSelector).to.equal('a');
        });
    });

    describe('Boundary Conditions Testing', () => {
        test('nth with very large index should work', async () => {
            const element = $('div').nth(999999);
            expect(element._nth).to.equal(999999);
            expect(await element.count()).to.be.lessThanOrEqual(1);
        });

        test('nth with negative index should work', async () => {
            const element = $('div').nth(-10);
            expect(element._nth).to.equal(-10);
        });

        test('nth with zero index should work', async () => {
            const element = $('div').nth(0);
            expect(element._nth).to.equal(0);
        });

        test('multiple chained nth calls should work', async () => {
            const element = $('div').nth(1).nth(2).nth(3);
            expect(element._nth).to.equal(3); // Last nth should override previous
        });

        test('very long selector strings should be handled', async () => {
            const longClassName = 'a'.repeat(1000);
            const element = $(`.${longClassName}`);
            expect(element.narrowSelector).to.equal(`.${longClassName}`);
        });

        test('selector with many special characters should be handled', async () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:",.<>?/';
            const element = $(`div[data-test="${specialChars}"]`);
            expect(element.narrowSelector).to.equal(`div[data-test="${specialChars}"]`);
        });

        test('Unicode characters in selectors should work', async () => {
            const element = $('div[data-test="тест"]');
            expect(element.narrowSelector).to.equal('div[data-test="тест"]');
        });

        test('Emoji in selectors should work', async () => {
            const element = $('div[data-test="🚀🎯"]');
            expect(element.narrowSelector).to.equal('div[data-test="🚀🎯"]');
        });
    });

    describe('Chaining Limits Testing', () => {
        test('multiple chained has methods should work', async () => {
            const element = $('div')
                .has('#child1')
                .has('#child2')
                .has('#child3');
            
            expect(element._hasLocator).to.equal('#child3'); // Last one should win
            expect(element._and).to.have.lengthOf(0);
        });

        test('multiple chained hasNot methods should work', async () => {
            const element = $('div')
                .hasNot('#exclude1')
                .hasNot('#exclude2')
                .hasNot('#exclude3');
            
            expect(element._hasNotLocator).to.equal('#exclude3'); // Last one should win
        });

        test('multiple chained hasText methods should work', async () => {
            const element = $('div')
                .hasText('text1')
                .hasText('text2')
                .hasText('text3');
            
            expect(element._hasText).to.equal('text3'); // Last one should win
        });

        test('multiple chained hasNotText methods should work', async () => {
            const element = $('div')
                .hasNotText('exclude1')
                .hasNotText('exclude2')
                .hasNotText('exclude3');
            
            expect(element._hasNotText).to.equal('exclude3'); // Last one should win
        });

        test('complex chain with all filter types should work', async () => {
            const element = $('div')
                .has('#child')
                .hasNot('#exclude')
                .hasText('include')
                .hasNotText('exclude')
                .nth(0)
                .and('#additional')
                .or('#alternative');
            
            expect(element._hasLocator).to.equal('#child');
            expect(element._hasNotLocator).to.equal('#exclude');
            expect(element._hasText).to.equal('include');
            expect(element._hasNotText).to.equal('exclude');
            expect(element._nth).to.equal(0);
            expect(element._and).to.have.lengthOf(1);
            expect(element._or).to.have.lengthOf(1);
        });
    });

    describe('Regex Pattern Testing', () => {
        test('hasText with regex pattern should work', async () => {
            const element = $('div').hasText(/\d+/);
            expect(element._hasText).to.be.instanceOf(RegExp);
        });

        test('hasNotText with regex pattern should work', async () => {
            const element = $('div').hasNotText(/\d+/);
            expect(element._hasNotText).to.be.instanceOf(RegExp);
        });

        test('complex regex patterns should work', async () => {
            const patterns = [
                /^test$/,
                /test/i,
                /test/g,
                /test/m,
                /[a-z]+/,
                /\d{3,5}/,
                /\w+@\w+\.\w+/,
            ];
            
            for (const pattern of patterns) {
                const element = $('div').hasText(pattern);
                expect(element._hasText).to.equal(pattern);
            }
        });

        test('regex with special characters should work', async () => {
            const pattern = /test\.example\$\^\+\*/;
            const element = $('div').hasText(pattern);
            expect(element._hasText).to.equal(pattern);
        });
    });

    describe('Array Operations Edge Cases', () => {
        test('getAll on element with many matches should work', async () => {
            const element = $('li'); // Should match multiple elements
            const all = await element.getAll();
            expect(all).to.be.an('array');
            expect(all.length).to.be.greaterThan(0);
        });

        test('asyncForEach with many elements should work', async () => {
            const element = $('li');
            let count = 0;
            await element.asyncForEach(() => { count++; });
            expect(count).to.be.greaterThan(0);
        });

        test('syncForEach with many elements should work', async () => {
            const element = $('li');
            let count = 0;
            await element.syncForEach(() => { count++; });
            expect(count).to.be.greaterThan(0);
        });

        test('map with transformation should work', async () => {
            const element = $('li');
            const result = await element.map(el => el.narrowSelector.toUpperCase());
            expect(result).to.be.an('array');
            expect(result.length).to.be.greaterThan(0);
        });

        test('filterElements with complex predicate should work', async () => {
            const element = $('li');
            const result = await element.filterElements(async el => {
                const text = await el.textContent();
                return text && text.includes('1');
            });
            expect(result).to.be.an('array');
        });
    });

    describe('Method Chaining Testing', () => {
        test('very long method chain should work', async () => {
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
            
            expect(element).to.be.instanceOf(WebElement);
            expect(element.narrowSelector).to.equal('div');
        });

        test('chain with subElements and methods should work', async () => {
            const element = $('div')
                .subElements({
                    child1: $('span'),
                    child2: $('a')
                })
                .withMethods({
                    customMethod: async () => 'custom'
                });
            
            expect(element).to.have.property('child1');
            expect(element).to.have.property('child2');
            expect(element).to.have.property('customMethod');
        });

        test('chain with all By selector types should work', async () => {
            const element = $('div')
                .$getByAltText('alt')
                .$getByLabel('label')
                .$getByPlaceholder('placeholder')
                .$getByRole('button')
                .$getByTestId('test-id')
                .$getByText('text')
                .$getByTitle('title');
            
            expect(element).to.be.instanceOf(WebElement);
            // Check that the chain is built correctly
            expect(element.narrowSelector).to.equal('title'); // Last one in chain
        });
    });

    describe('Clone and Immutability Testing', () => {
        test('clone should create independent copy', async () => {
            const original = $('div').hasText('test');
            const clone = original.clone();
            
            // Modifying clone should not affect original
            clone._hasText = 'modified';
            expect(original._hasText).to.equal('test');
        });

        test('multiple clones should be independent', async () => {
            const original = $('div').hasText('test');
            const clone1 = original.clone();
            const clone2 = original.clone();
            
            clone1._hasText = 'clone1';
            clone2._hasText = 'clone2';
            
            expect(original._hasText).to.equal('test');
            expect(clone1._hasText).to.equal('clone1');
            expect(clone2._hasText).to.equal('clone2');
        });

        test('clone with overrides should not affect original', async () => {
            const original = $('div').hasText('test').nth(0);
            const clone = original.clone({ hasText: 'new', nth: 1 });
            
            expect(original._hasText).to.equal('test');
            expect(original._nth).to.equal(0);
            expect(clone._hasText).to.equal('new');
            expect(clone._nth).to.equal(1);
        });

        test('subElements should create independent elements', async () => {
            const parent1 = $('div');
            
            parent1.subElements({
                child: $('a')
            });
            
            // The child should have parent1 as parent
            const child = (parent1 as any).child;
            expect(child.parent()).to.equal(parent1);
        });
    });

    describe('Special Character and Encoding Testing', () => {
        test('whitespace in selectors should work', async () => {
            const element = $('div[ data-test = "value" ]');
            expect(element.narrowSelector).to.equal('div[ data-test = "value" ]');
        });

        test('newlines in selectors should work', async () => {
            const element = $('div\nspan');
            expect(element.narrowSelector).to.equal('div\nspan');
        });

        test('tabs in selectors should work', async () => {
            const element = $('div\tspan');
            expect(element.narrowSelector).to.equal('div\tspan');
        });

        test('quoted selectors should work', async () => {
            const element = $('"div span"');
            expect(element.narrowSelector).to.equal('"div span"');
        });

        test('CSS escape sequences should work', async () => {
            const element = $('#test\\:id');
            expect(element.narrowSelector).to.equal('#test\\:id');
        });
    });

    describe('Performance and Scalability Testing', () => {
        test('creating many WebElement instances should work', async () => {
            const elements: WebElement[] = [];
            for (let i = 0; i < 1000; i++) {
                elements.push($(`#element-${i}`));
            }
            expect(elements).to.have.lengthOf(1000);
        });

        test('creating deeply nested structure should work', async () => {
            let element: WebElement = $('html');
            for (let i = 0; i < 20; i++) {
                element = element.$(`div:nth-child(${i})`);
            }
            expect(element.selector).to.be.a('string');
        });

        test('complex selector with many conditions should work', async () => {
            let element = $('div');
            for (let i = 0; i < 20; i++) {
                element = element.and(`#condition-${i}`);
            }
            expect(element._and).to.have.lengthOf(20);
        });
    });
});
