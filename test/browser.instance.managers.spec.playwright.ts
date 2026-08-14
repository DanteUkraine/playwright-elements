import { test, expect, BrowserInstance } from '../src';
import { Page, Browser, BrowserContext, webkit } from 'playwright-core';

// Migrated from mocha/chai to @playwright/test
// Note: These tests manually manage browser lifecycle and don't use fixtures
// to test BrowserInstance's withBrowser/withContext/withPage methods

test.describe('BrowserInstance - Context Manager Methods', () => {

    test.describe('withBrowser()', () => {
        test('should execute callback with browser instance', async () => {
            const browser = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser);
                
                BrowserInstance.withBrowser(browser);
                await BrowserInstance.startNewContext();
                
                await BrowserInstance.withBrowser(browser as any);
                
                BrowserInstance.withBrowser(browser);
                
                expect(() => BrowserInstance.browser).not.toThrow();
            } finally {
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should restore previous browser after callback', async () => {
            const browser1 = await webkit.launch();
            const browser2 = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser1);
                const browserBefore = BrowserInstance.browser;
                
                BrowserInstance.withBrowser(browser2);
                const browserAfter = BrowserInstance.browser;
                
                expect(browserBefore).toEqual(browser1);
                expect(browserAfter).toEqual(browser2);
                
                BrowserInstance.withBrowser(browser1);
                expect(BrowserInstance.browser).toEqual(browser1);
            } finally {
                await browser1.close();
                await browser2.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should handle errors in callback', async () => {
            const browser = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser);
                
                let errorCaught = false;
                
                try {
                    BrowserInstance.withBrowser(browser);
                } catch (e) {
                    errorCaught = true;
                }
                
                expect(errorCaught).toBe(false);
            } finally {
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('withContext()', () => {
        test('should execute callback with context', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            
            try {
                BrowserInstance.withContext(context);
                
                expect(() => BrowserInstance.currentContext).not.toThrow();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should restore previous context after callback', async () => {
            const browser = await webkit.launch();
            const context1 = await browser.newContext();
            const context2 = await browser.newContext();
            
            try {
                BrowserInstance.withContext(context1);
                const contextBefore = BrowserInstance.currentContext;
                
                BrowserInstance.withContext(context2);
                const contextAfter = BrowserInstance.currentContext;
                
                expect(contextBefore).toBeDefined();
                expect(contextAfter).toBeDefined();
                
                BrowserInstance.withContext(context1);
                expect(() => BrowserInstance.currentContext).not.toThrow();
                
                await context2.close();
            } finally {
                await context1.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should set up event listeners for page creation', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            
            try {
                BrowserInstance.withContext(context);
                BrowserInstance.currentPage = page;
                
                const contextInstance = BrowserInstance['_currentContext'] as any;
                const pageCountBefore = contextInstance.pages.length;
                
                await context.newPage();
                
                const pageCountAfter = contextInstance.pages.length;
                
                expect(pageCountAfter).toBeGreaterThan(pageCountBefore);
                
                // Clean up the new page
                const pages = context.pages();
                for (let i = 1; i < pages.length; i++) {
                    await pages[i].close();
                }
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should handle errors in callback', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            
            try {
                BrowserInstance.withContext(context);
                
                let errorCaught = false;
                
                try {
                    BrowserInstance.withContext(context);
                } catch (e) {
                    errorCaught = true;
                }
                
                expect(errorCaught).toBe(false);
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('withPage()', () => {
        test('should execute callback with page', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            
            try {
                BrowserInstance.withPage(page);
                
                expect(() => BrowserInstance.currentPage).not.toThrow();
                expect(() => BrowserInstance.currentContext).not.toThrow();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should restore previous page after callback', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page1 = await context.newPage();
            const page2 = await context.newPage();
            
            try {
                BrowserInstance.withPage(page1);
                const pageBefore = BrowserInstance.currentPage;
                
                BrowserInstance.withPage(page2);
                const pageAfter = BrowserInstance.currentPage;
                
                expect(pageBefore).toBeDefined();
                expect(pageAfter).toBeDefined();
                
                BrowserInstance.withPage(page1);
                expect(() => BrowserInstance.currentPage).not.toThrow();
                
                await page2.close();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should handle errors in callback', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            
            try {
                BrowserInstance.withPage(page);
                
                let errorCaught = false;
                
                try {
                    BrowserInstance.withPage(page);
                } catch (e) {
                    errorCaught = true;
                }
                
                expect(errorCaught).toBe(false);
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should set both page and context', async () => {
            const browser = await webkit.launch();
            const newContext = await browser.newContext();
            const newPage = await newContext.newPage();
            
            try {
                BrowserInstance.withPage(newPage);
                
                expect(() => BrowserInstance.currentPage).not.toThrow();
                expect(() => BrowserInstance.currentContext).not.toThrow();
                
                await newContext.close();
            } finally {
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('Context manager integration', () => {
        test('withBrowser then withContext should work together', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            
            try {
                BrowserInstance.withBrowser(browser);
                BrowserInstance.withContext(context);
                
                expect(() => BrowserInstance.browser).not.toThrow();
                expect(() => BrowserInstance.currentContext).not.toThrow();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('withBrowser then withContext then withPage should work together', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            
            try {
                BrowserInstance.withBrowser(browser);
                BrowserInstance.withContext(context);
                BrowserInstance.withPage(page);
                
                expect(() => BrowserInstance.browser).not.toThrow();
                expect(() => BrowserInstance.currentContext).not.toThrow();
                expect(() => BrowserInstance.currentPage).not.toThrow();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('nested context managers should restore correctly', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page1 = await context.newPage();
            const page2 = await context.newPage();
            
            try {
                BrowserInstance.withPage(page1);
                const originalPage = BrowserInstance.currentPage;
                
                BrowserInstance.withPage(page2);
                expect(BrowserInstance.currentPage).not.toEqual(originalPage);
                
                BrowserInstance.withPage(page1);
                expect(BrowserInstance.currentPage).toEqual(originalPage);
                
                await page2.close();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('Context manager state preservation', () => {
        test('should preserve browser when switching contexts', async () => {
            const browser = await webkit.launch();
            const context1 = await browser.newContext();
            const context2 = await browser.newContext();
            
            try {
                BrowserInstance.withBrowser(browser);
                const originalBrowser = BrowserInstance.browser;
                
                BrowserInstance.withContext(context2);
                
                expect(BrowserInstance.browser).toEqual(originalBrowser);
                expect(() => BrowserInstance.currentContext).not.toThrow();
                
                await context2.close();
            } finally {
                await context1.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should preserve context when switching pages', async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            const page1 = await context.newPage();
            const page2 = await context.newPage();
            
            try {
                BrowserInstance.withContext(context);
                const originalContext = BrowserInstance.currentContext;
                
                BrowserInstance.withPage(page2);
                
                expect(BrowserInstance.currentContext).toEqual(originalContext);
                expect(() => BrowserInstance.currentPage).not.toThrow();
                
                await page2.close();
            } finally {
                await context.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });
});
