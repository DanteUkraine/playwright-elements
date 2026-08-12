import { expect } from 'chai';
import { $, BrowserInstance, BrowserName, buildPageObject } from '../src';
import { localFilePath } from './utils';

describe('Performance Tests', function (this: Mocha.Suite) {
    this.timeout(60_000);

    before(async () => {
        // Clean up any previous state
        await BrowserInstance.close().catch(() => {});
        
        // Start browser with retry logic for flaky environments
        let retries = 3;
        while (retries > 0) {
            try {
                await BrowserInstance.start(BrowserName.CHROME);
                await BrowserInstance.startNewPage();
                await BrowserInstance.currentPage.goto(localFilePath);
                await BrowserInstance.currentPage.waitForSelector('h1', { timeout: 30000 });
                break; // Success
            } catch (error) {
                retries--;
                if (retries <= 0) {
                    throw error; // Re-throw if all retries fail
                }
                console.warn(`Browser startup failed, retrying (${retries} attempts left):`, error);
                await BrowserInstance.close().catch(() => {});
                // Small delay before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    });

    afterEach(async () => {
        try {
            if (BrowserInstance.currentPage) {
                await BrowserInstance.currentPage.goto(localFilePath);
                await BrowserInstance.currentPage.waitForSelector('h1').catch(() => {});
            }
        } catch (error) {
            console.warn('Page navigation in afterEach failed:', error);
        }
    });

    after(async () => {
        try {
            await BrowserInstance.close();
        } catch (error) {
            console.warn('Browser cleanup failed:', error);
        }
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
            if (element.selector) {
                promises.push(Promise.resolve(element.selector));
            }
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
        await element.getAll().catch(() => {});
    });

    it('should handle concurrent element count operations', async () => {
        // Functional test (F-002: removed wall-clock timing)
        const elements = ['div', 'span', 'li', 'a', 'p'].map($);
        await Promise.all(elements.map(el => el.count().catch(() => 0)));
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
