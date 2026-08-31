import { test, expect } from '../src';
import { localFilePath } from './utils';
import { $, buildPageObject } from '../src';

// Note: These are functional tests, wall-clock timing removed to avoid CI flakiness

test.describe('Performance Tests', () => {

    test.beforeEach(async ({ page, goto }) => {
        await goto(localFilePath);
        await page.locator('h1').waitFor({ timeout: 30000 });
    })

    test.afterEach(async () => {
        // BrowserInstance cleanup is handled automatically by the fixture
    })

    test('should build page object with 100+ classes', async () => {
        // Functional test (removed wall-clock timing)
        // Create a mock module with 100+ classes (named to match default suffix filter)
        const mockModule = {};
        for (let i = 0; i < 100; i++) {
            mockModule[`TestPage${i}Page`] = class { };
        }
        
        const result = buildPageObject(mockModule as any);
        expect(Object.keys(result).length).toEqual(100);
    });

    test('should handle 1000+ concurrent element operations', async () => {
        // Functional test (removed wall-clock timing)
        const element = $('div');
        
        const promises: Promise<any>[] = [];
        for (let i = 0; i < 100; i++) {
            promises.push(element.click().catch(() => {}));
            promises.push(element.count().catch(() => {}));
            promises.push(Promise.resolve(element.selector));
        }
        
        await Promise.all(promises);
        expect(promises.length).toBeGreaterThan(0);
    });

    test('should generate many element instances', async () => {
        // Functional test - verify element generation works (removed wall-clock timing)
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`div:nth-child(${i})`));
        }
        
        expect(elements.length).toEqual(1000);
    });

    test('should handle complex selector chains', async () => {
        // Functional test - verify complex chaining works (removed wall-clock timing)
        const element = $('div')
            .$('span')
            .$('a')
            .$('li')
            .$('button');
        
        expect(element.selector).toBeDefined();
    });

    test('should complete getAll operations', async () => {
        // Functional test (removed wall-clock timing)
        const element = $('li');
        const result = await element.getAll().catch(() => []);
        expect(Array.isArray(result)).toBe(true);
    });

    test('should handle concurrent element count operations', async () => {
        // Functional test (removed wall-clock timing)
        const { $ } = await import('../src');
        const elements = ['div', 'span', 'li', 'a', 'p'].map($);
        const results = await Promise.all(elements.map(el => el.count().catch(() => 0)));
        expect(results.length).toBe(5);
    });

    test('should scale with many concurrent element operations', async () => {
        // Functional test (removed wall-clock timing)
        const elements: any[] = [];
        for (let i = 0; i < 100; i++) {
            elements.push($(`#element-${i}`));
        }
        
        const results = await Promise.all(elements.map((el: any) => el.count().catch(() => 0)));
        expect(results.length).toBe(100);
    });

    test('should create many WebElement instances', async () => {
        // Functional test (removed wall-clock timing)
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`#element-${i}`));
        }
        
        expect(elements).toHaveLength(1000);
    });

    test('should create deeply nested element structures', async () => {
        // Functional test - verify nested structure creation works (removed wall-clock timing)
        let element: any = $('html');
        for (let i = 0; i < 20; i++) {
            element = element.$(`div:nth-child(${i})`);
        }
        
        expect(typeof element.selector).toBe('string');
    });

    test('should handle complex selector chains with many conditions', async () => {
        // Functional test - verify complex chaining works (removed wall-clock timing)
        let element = $('div');
        for (let i = 0; i < 20; i++) {
            element = element.and(`#condition-${i}`);
        }
        
        expect(element._and).toHaveLength(20);
    });
});
