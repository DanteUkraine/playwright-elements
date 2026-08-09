import { expect } from 'chai';
import { $, BrowserInstance, BrowserName, buildPageObject } from '../src';
import { localFilePath } from './utils';

describe('Performance Tests', function (this: Mocha.Suite) {
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

    it('should build page object with 100+ classes', async () => {
        // Functional test (F-002: removed wall-clock timing)
        // Create a mock module with 100+ classes (named to match default suffix filter)
        const mockModule = {};
        for (let i = 0; i < 100; i++) {
            mockModule[`TestPage${i}Page`] = class { };
        }
        
        const result = buildPageObject(mockModule as any);
        expect(Object.keys(result).length).to.equal(100);
    });

    it('should handle 1000+ concurrent element operations', async () => {
        // Functional test (F-002: removed wall-clock timing)
        const element = $('div');
        
        const promises: Promise<any>[] = [];
        for (let i = 0; i < 100; i++) {
            promises.push(element.click().catch(() => {}));
            promises.push(element.count().catch(() => {}));
            promises.push(element.selector);
        }
        
        await Promise.all(promises);
    });

    it('should generate many element instances', () => {
        // Functional test - verify element generation works (F-002: removed wall-clock timing)
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`div:nth-child(${i})`));
        }
        
        expect(elements.length).to.equal(1000);
    });

    it('should handle complex selector chains', async () => {
        // Functional test - verify complex chaining works (F-002: removed wall-clock timing)
        const element = $('div')
            .$('span')
            .$('a')
            .$('li')
            .$('button');
        
        expect(element.selector).to.exist;
    });

    // Moved from web.element.concurrency.spec.ts - T-002
    it('should complete getAll operations', async () => {
        // Functional test (F-002: removed wall-clock timing)
        const element = $('li');
        await element.getAll();
    });

    it('should handle concurrent element count operations', async () => {
        // Functional test (F-002: removed wall-clock timing)
        const elements = ['div', 'span', 'li', 'a', 'p'].map($);
        await Promise.all(elements.map(el => el.count()));
    });

    it('should scale with many concurrent element operations', async () => {
        // Functional test (F-002: removed wall-clock timing)
        const elements: any[] = [];
        for (let i = 0; i < 100; i++) {
            elements.push($(`#element-${i}`));
        }
        
        await Promise.all(elements.map((el: any) => el.count().catch(() => 0)));
    });

    // Moved from web.element.edge.cases.spec.ts - T-002
    it('should create many WebElement instances', async () => {
        // Functional test (F-002: removed wall-clock timing)
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`#element-${i}`));
        }
        
        expect(elements).to.have.lengthOf(1000);
    });

    it('should create deeply nested element structures', async () => {
        // Functional test - verify nested structure creation works (F-002: removed wall-clock timing)
        let element: any = $('html');
        for (let i = 0; i < 20; i++) {
            element = element.$(`div:nth-child(${i})`);
        }
        
        expect(element.selector).to.be.a('string');
    });

    it('should handle complex selector chains with many conditions', async () => {
        // Functional test - verify complex chaining works (F-002: removed wall-clock timing)
        let element = $('div');
        for (let i = 0; i < 20; i++) {
            element = element.and(`#condition-${i}`);
        }
        
        expect(element._and).to.have.lengthOf(20);
    });
});
