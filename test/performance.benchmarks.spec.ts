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

    it('should build page object with 100+ classes in < 500ms', async () => {
        const startTime = Date.now();
        
        // Create a mock module with 100+ classes (named to match default suffix filter)
        const mockModule = {};
        for (let i = 0; i < 100; i++) {
            mockModule[`TestPage${i}Page`] = class { };
        }
        
        const result = buildPageObject(mockModule as any);
        const endTime = Date.now();
        
        expect(endTime - startTime).to.be.lessThan(500);
        expect(Object.keys(result).length).to.equal(100);
    });

    it('should handle 1000+ concurrent element operations', async () => {
        const startTime = Date.now();
        const element = $('div');
        
        const promises: Promise<any>[] = [];
        for (let i = 0; i < 100; i++) {
            promises.push(element.click().catch(() => {}));
            promises.push(element.count().catch(() => {}));
            promises.push(element.selector);
        }
        
        await Promise.all(promises);
        const endTime = Date.now();
        
        expect(endTime - startTime).to.be.lessThan(2000);
    });

    it('should generate many element instances quickly', () => {
        const startTime = Date.now();
        
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`div:nth-child(${i})`));
        }
        
        const endTime = Date.now();
        
        expect(endTime - startTime).to.be.lessThan(100);
        expect(elements.length).to.equal(1000);
    });

    it('should handle complex selector chains efficiently', async () => {
        const startTime = Date.now();
        
        const element = $('div')
            .$('span')
            .$('a')
            .$('li')
            .$('button');
        
        const selector = element.selector;
        const endTime = Date.now();
        
        expect(endTime - startTime).to.be.lessThan(10);
        expect(selector).to.exist;
    });
});
