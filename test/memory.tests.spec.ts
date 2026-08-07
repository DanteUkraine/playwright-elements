import { expect } from 'chai';
import { $, BrowserInstance, BrowserName, buildPageObject, generateIndexFile } from '../src';
import { localFilePath } from './utils';
import fs from 'fs';
import { join } from 'path';

describe('Memory Tests', function (this: Mocha.Suite) {
    this.timeout(15_000);

    const tempDir = join(__dirname, 'tempMemoryTest');

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
        
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    afterEach(async () => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    after(async () => {
        try {
            if (BrowserInstance.browser) {
                await BrowserInstance.close();
            }
        } catch (e) {
            // Ignore errors during cleanup
        }
    });

    it('should not leak memory with repeated page object creation', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        for (let i = 0; i < 100; i++) {
            const mockModule = {
                [`Page${i}`]: class { }
            };
            buildPageObject(mockModule as any);
        }
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryDiff = finalMemory - initialMemory;
        
        // Memory should not grow significantly (less than 10MB for 100 objects)
        expect(memoryDiff).to.be.lessThan(10 * 1024 * 1024);
    });

    it('should clean up watchers properly', async () => {
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(join(tempDir, 'file1.ts'), 'export class Test1 {}');
        
        const manager = generateIndexFile(tempDir, { watch: true, cliLog: false });
        
        expect(manager.watchers.length).to.be.greaterThan(0);
        
        await manager.closeAll();
        
        expect(manager.watchers.length).to.equal(0);
    });

    it('should handle many element creations without memory bloat', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`div:nth-child(${i})`));
        }
        
        // Clear the array to allow GC
        elements.length = 0;
        
        if (global.gc) {
            global.gc();
        }
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryDiff = finalMemory - initialMemory;
        
        // Should not grow significantly
        expect(memoryDiff).to.be.lessThan(5 * 1024 * 1024);
    });

    it('should properly clean up index generation resources', async () => {
        fs.mkdirSync(tempDir, { recursive: true });
        
        for (let i = 0; i < 10; i++) {
            fs.writeFileSync(join(tempDir, `file${i}.ts`), `export class Test${i} {}`);
        }
        
        generateIndexFile(tempDir, { watch: false, cliLog: false });
        
        expect(fs.existsSync(join(tempDir, 'index.ts'))).to.be.true;
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        expect(fs.existsSync(tempDir)).to.be.false;
    });

    it('should not retain references to closed browsers', async () => {
        // Save reference before closing
        const browserBefore = BrowserInstance.browser;
        expect(browserBefore).to.exist;
        
        await BrowserInstance.close();
        
        // After closing, browser should be undefined (access via getter throws, so use internal)
        expect((BrowserInstance as any)._browser).to.be.undefined;
        expect((BrowserInstance as any)._browser).not.to.equal(browserBefore);
    });
});
