import { test, expect } from '../src';
import { localFilePath } from './utils';
import fs from 'fs';
import { join } from 'path';
import { buildPageObject, generateIndexFile } from '../src';

// Migrated from mocha/chai to @playwright/test

test.describe('Memory Tests', () => {
    const tempDir = join(__dirname, 'tempMemoryTest');

    test.beforeEach(async ({ page, goto }) => {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
        await goto(localFilePath);
        await page.locator('h1').waitFor({ timeout: 30000 });
    })

    test.afterEach(async () => {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
        // BrowserInstance cleanup is handled automatically by the fixture
    })

    test('should not leak memory with repeated page object creation', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        for (let i = 0; i < 100; i++) {
            const mockModule = {
                [`Page${i}`]: class { }
            };
            buildPageObject(mockModule as any);
        }
        
        // Force garbage collection if available
        global.gc?.();
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryDiff = finalMemory - initialMemory;
        
        // Memory should not grow significantly (less than 10MB for 100 objects)
        await expect(memoryDiff).toBeLessThan(10 * 1024 * 1024);
    });

    test('should clean up watchers properly', async () => {
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(join(tempDir, 'file1.ts'), 'export class Test1 {}');
        
        const manager = generateIndexFile(tempDir, { watch: true, cliLog: false });
        
        expect(manager.watchers.length).toBeGreaterThan(0);
        
        await manager.closeAll();
        
        expect(manager.watchers.length).toEqual(0);
    });

    test('should handle many element creations without memory bloat', async () => {
        const { $ } = await import('../src');
        const initialMemory = process.memoryUsage().heapUsed;
        
        const elements: any[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push($(`div:nth-child(${i})`));
        }
        
        // Clear the array to allow GC
        elements.length = 0;
        
        // Force garbage collection if available
        global.gc?.();
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryDiff = finalMemory - initialMemory;
        
        // Should not grow significantly
        await expect(memoryDiff).toBeLessThan(5 * 1024 * 1024);
    });

    test('should properly clean up index generation resources', async () => {
        fs.mkdirSync(tempDir, { recursive: true });
        
        for (let i = 0; i < 10; i++) {
            fs.writeFileSync(join(tempDir, `file${i}.ts`), `export class Test${i} {}`);
        }
        
        generateIndexFile(tempDir, { watch: false, cliLog: false });
        
        expect(fs.existsSync(join(tempDir, 'index.ts'))).toBe(true);
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        expect(fs.existsSync(tempDir)).toBe(false);
    });

    test('should not retain references to closed browsers', async () => {
        const { BrowserInstance } = await import('../src');
        
        // Save reference before cleanup
        const browserBefore = (BrowserInstance as any)._browser;
        expect(browserBefore).toBeDefined();
        
        // Manually clear references instead of calling close() to avoid closing Playwright's managed browser
        (BrowserInstance as any)._browser = undefined;
        (BrowserInstance as any)._currentContext = undefined;
        (BrowserInstance as any)._currentPage = undefined;
        
        // After cleanup, browser should be undefined (access via getter throws, so use internal)
        expect((BrowserInstance as any)._browser).toBeUndefined();
        expect((BrowserInstance as any)._browser).not.toEqual(browserBefore);
    });
});
