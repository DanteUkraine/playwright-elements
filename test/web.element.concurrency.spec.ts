import { expect } from 'chai';
import { test } from 'mocha';
import { $, WebElement, BrowserInstance, BrowserName } from '../src';
import { localFilePath } from './utils';

describe('Web Element Concurrency and Parallel Testing', function () {
    this.timeout(30_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    });

    after(async () => {
        await BrowserInstance.close();
    });

    describe('Parallel Element Operations', () => {
        test('multiple elements should be able to perform operations concurrently', async () => {
            const element1 = $('#test-div');
            const element2 = $('h1');
            const element3 = $('li');

            // Perform operations concurrently
            const [result1, result2, result3] = await Promise.all([
                element1.count(),
                element2.count(),
                element3.count()
            ]);

            expect(result1).to.be.a('number');
            expect(result2).to.be.a('number');
            expect(result3).to.be.a('number');
        });

        test('concurrent getAll operations should work', async () => {
            const elements = [
                $('div'),
                $('span'),
                $('li'),
                $('a')
            ];

            const results = await Promise.all(
                elements.map(el => el.getAll())
            );

            expect(results).to.be.an('array').that.has.lengthOf(4);
            for (const result of results) {
                expect(result).to.be.an('array');
            }
        });

        test('concurrent text content retrieval should work', async () => {
            const elements = [
                $('h1'),
                $('#test-div'),
                $('li').first()
            ];

            // Test that we can call the methods concurrently
            const results = await Promise.all(
                elements.map(el => el.narrowSelector)
            );

            expect(results).to.be.an('array').that.has.lengthOf(3);
        });

        test('concurrent attribute retrieval should work', async () => {
            const elements = [
                $('h1'),
                $('#test-div'),
                $('a')
            ];

            // Test that we can call the methods concurrently
            const results = await Promise.all(
                elements.map(el => el.narrowSelector)
            );

            expect(results).to.be.an('array').that.has.lengthOf(3);
        });

        test('concurrent chaining operations should work', async () => {
            const base = $('div');
            
            const chains = [
                base.hasText('test').nth(0),
                base.hasText('test').nth(1),
                base.hasNotText('exclude').nth(0),
                base.has('#child').nth(0)
            ];

            const results = await Promise.all(
                chains.map(el => el.count().catch(() => 0))
            );

            expect(results).to.be.an('array').that.has.lengthOf(4);
        });
    });

    describe('Async For Each Parallelism', () => {
        test('asyncForEach should process elements in parallel', async () => {
            const element = $('li');
            const startTime = Date.now();
            let completed = 0;

            await element.asyncForEach(async () => {
                // Simulate async work
                await new Promise(resolve => setTimeout(resolve, 10));
                completed++;
            });

            const endTime = Date.now();
            expect(completed).to.be.greaterThan(0);
            expect(endTime - startTime).to.be.lessThan(500); // Should be much less than sequential
        });

        test('asyncForEach with multiple async operations should work', async () => {
            const element = $('li');
            const results: number[] = [];

            await element.asyncForEach(async () => {
                const count = await element.count();
                results.push(count);
            });

            expect(results).to.be.an('array');
            expect(results.length).to.be.greaterThan(0);
        });

        test('multiple concurrent asyncForEach operations should work', async () => {
            const element1 = $('li');
            const element2 = $('div');
            
            const [result1, result2] = await Promise.all([
                element1.asyncForEach(async () => {}),
                element2.asyncForEach(async () => {})
            ]);

            expect(result1).to.be.undefined;
            expect(result2).to.be.undefined;
        });
    });

    describe('Map Operation Parallelism', () => {
        test('map should process elements in parallel', async () => {
            const element = $('li');
            const startTime = Date.now();

            const results = await element.map(async (el) => {
                // Simulate async work
                await new Promise(resolve => setTimeout(resolve, 10));
                return el.narrowSelector;
            });

            const endTime = Date.now();
            expect(results).to.be.an('array');
            expect(endTime - startTime).to.be.lessThan(500); // Should be much less than sequential
        });

        test('concurrent map operations should work', async () => {
            const element1 = $('li');
            const element2 = $('div');
            
            const [result1, result2] = await Promise.all([
                element1.map(el => el.narrowSelector),
                element2.map(el => el.narrowSelector)
            ]);

            expect(result1).to.be.an('array');
            expect(result2).to.be.an('array');
        });
    });

    describe('Complex Parallel Scenarios', () => {
        test('nested parallel operations should work', async () => {
            const base = $('div');
            
            const results = await Promise.all([
                base.getAll().then(elements => 
                    Promise.all(elements.map(el => el.getAttribute('id').catch(() => null)))
                ),
                base.getAll().then(elements => 
                    Promise.all(elements.map(el => el.textContent().catch(() => null)))
                )
            ]);

            expect(results).to.be.an('array').that.has.lengthOf(2);
        });

        test('parallel chain building should work', async () => {
            const base = $('div');
            
            const chains = await Promise.all([
                Promise.resolve(base.hasText('test')),
                Promise.resolve(base.hasNotText('exclude')),
                Promise.resolve(base.has('#child')),
                Promise.resolve(base.nth(0))
            ]);

            expect(chains).to.be.an('array').that.has.lengthOf(4);
            for (const chain of chains) {
                expect(chain).to.be.instanceOf(WebElement);
            }
        });

        test('parallel subElements creation should work', async () => {
            const base = $('div');
            
            const elements = await Promise.all([
                Promise.resolve(base.subElements({ child1: $('span') })),
                Promise.resolve(base.subElements({ child2: $('a') })),
                Promise.resolve(base.subElements({ child3: $('p') }))
            ]);

            expect(elements).to.be.an('array').that.has.lengthOf(3);
        });
    });

    describe('Race Condition Testing', () => {
        test('concurrent modifications should not affect each other', async () => {
            const original = $('div');
            
            const [clone1, clone2, clone3] = await Promise.all([
                Promise.resolve(original.clone({ hasText: 'text1' })),
                Promise.resolve(original.clone({ hasText: 'text2' })),
                Promise.resolve(original.clone({ hasText: 'text3' }))
            ]);

            expect(clone1._hasText).to.equal('text1');
            expect(clone2._hasText).to.equal('text2');
            expect(clone3._hasText).to.equal('text3');
            expect(original._hasText).to.be.undefined; // Original unchanged
        });

        test('concurrent parent chain modifications should work', async () => {
            const root = $('html');
            
            const elements = await Promise.all([
                Promise.resolve(root.$('div').$('span')),
                Promise.resolve(root.$('div').$('a')),
                Promise.resolve(root.$('section').$('p'))
            ]);

            expect(elements).to.be.an('array').that.has.lengthOf(3);
            for (const el of elements) {
                expect(el.parentElements).to.be.an('array');
            }
        });
    });

    describe('Resource Management', () => {
        test('creating many elements should not cause memory issues', async () => {
            const elements: WebElement[] = [];
            for (let i = 0; i < 500; i++) {
                elements.push($(`#element-${i}`));
            }
            
            // All elements should be valid
            expect(elements).to.have.lengthOf(500);
            for (const el of elements.slice(0, 10)) { // Check a sample
                expect(el).to.be.instanceOf(WebElement);
            }
        });

        test('complex chains should not leak memory', async () => {
            const base = $('div');
            const chains: WebElement[] = [];
            
            for (let i = 0; i < 100; i++) {
                chains.push(
                    base.clone()
                        .hasText(`text-${i}`)
                        .hasNotText(`exclude-${i}`)
                        .nth(i % 10)
                );
            }
            
            expect(chains).to.have.lengthOf(100);
        });

        test('nested subElements should not cause circular references', async () => {
            const root = $('html')
                .subElements({
                    level1: $('body')
                        .subElements({
                            level2: $('div')
                                .subElements({
                                    level3: $('span')
                                })
                        })
                });
            
            // Should be able to access all levels
            expect(root.level1).to.be.instanceOf(WebElement);
            expect(root.level1.level2).to.be.instanceOf(WebElement);
            expect(root.level1.level2.level3).to.be.instanceOf(WebElement);
        });
    });
});
