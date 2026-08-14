import { test, expect } from '../src';
import { webkit } from 'playwright-core';
import { BrowserInstance, Context } from '../src';

// Migrated from mocha/chai to @playwright/test
// Note: These tests manually manage browser lifecycle to test Context class

test.describe('BrowserInstance - Context Class', () => {

    test.describe('Context class via withContext()', () => {
        test('should create Context instance with BrowserContext', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                expect(contextInstance).toBeDefined();
                expect(contextInstance).toBeInstanceOf(Context);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('Context.get should return the BrowserContext', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                const browserContext = contextInstance.get;
                
                expect(browserContext).toBeDefined();
                expect(browserContext).toEqual(playwrightContext);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('Context.pages should return all pages in context', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            const page = await playwrightContext.newPage();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                const pages = contextInstance.pages;
                
                expect(Array.isArray(pages)).toBeTruthy();
                expect(pages.length).toBeGreaterThanOrEqual(1);
                expect(pages[0]).toBeDefined();
            } finally {
                await page.close();
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('Context.pages should include newly created pages', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            const initialPage = await playwrightContext.newPage();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                await playwrightContext.newPage();
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                const pages = contextInstance.pages;
                
                expect(Array.isArray(pages)).toBeTruthy();
                expect(pages.length).toBeGreaterThanOrEqual(2);
                
                // Clean up the extra page
                const allPages = playwrightContext.pages();
                for (let i = 1; i < allPages.length; i++) {
                    await allPages[i].close();
                }
            } finally {
                await initialPage.close();
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('Context.isMobile should default to false', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                const isMobile = contextInstance.isMobile;
                
                expect(isMobile).toBe(false);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('Context.isMobile should be settable to true', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                contextInstance.isMobile = true;
                
                expect(contextInstance.isMobile).toBe(true);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('Context.isMobile should be settable to false', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                contextInstance.isMobile = true;
                contextInstance.isMobile = false;
                
                expect(contextInstance.isMobile).toBe(false);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('Context.previousPage', () => {
        test('should throw error when previousPage not initialized', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                
                expect(() => contextInstance.previousPage).toThrow(/Previous page was not initialized/);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should set and get previousPage', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            const page = await playwrightContext.newPage();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                contextInstance.previousPage = page;
                
                expect(contextInstance.previousPage).toEqual(page);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('should update previousPage when set multiple times', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            const page1 = await playwrightContext.newPage();
            const page2 = await playwrightContext.newPage();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                
                contextInstance.previousPage = page1;
                expect(contextInstance.previousPage).toEqual(page1);
                
                contextInstance.previousPage = page2;
                expect(contextInstance.previousPage).toEqual(page2);
                
                await page2.close();
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('Context class integration with BrowserInstance', () => {
        test('BrowserInstance.isContextMobile should reflect Context.isMobile', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                expect(BrowserInstance.isContextMobile).toBe(false);
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                contextInstance.isMobile = true;
                
                expect(BrowserInstance.isContextMobile).toBe(true);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('BrowserInstance.isContextMobile should update Context.isMobile', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                
                BrowserInstance.isContextMobile = true;
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                expect(contextInstance.isMobile).toBe(true);
                
                BrowserInstance.isContextMobile = false;
                expect(contextInstance.isMobile).toBe(false);
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('withContext should set up page event listeners', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            const page = await playwrightContext.newPage();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                BrowserInstance.currentPage = page;
                
                const initialPage = BrowserInstance.currentPage;
                
                await playwrightContext.newPage();
                
                expect(BrowserInstance.currentPage).toBeDefined();
                expect(BrowserInstance.currentPage).not.toEqual(initialPage);
                
                // Clean up the extra page
                const allPages = playwrightContext.pages();
                for (let i = 1; i < allPages.length; i++) {
                    await allPages[i].close();
                }
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('withContext page event listener should track previous page', async () => {
            const browser = await webkit.launch();
            const playwrightContext = await browser.newContext();
            const page = await playwrightContext.newPage();
            
            try {
                BrowserInstance.withContext(playwrightContext);
                BrowserInstance.currentPage = page;
                
                await playwrightContext.newPage();
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                expect(contextInstance.previousPage).toBeDefined();
                
                // Clean up the extra page
                const allPages = playwrightContext.pages();
                for (let i = 1; i < allPages.length; i++) {
                    await allPages[i].close();
                }
            } finally {
                await playwrightContext.close();
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });

    test.describe('Context class with startNewContext()', () => {
        test('startNewContext should create Context with event listeners', async () => {
            const browser = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser);
                await BrowserInstance.startNewContext();
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                expect(contextInstance).toBeDefined();
                expect(contextInstance).toBeInstanceOf(Context);
                expect(contextInstance.get).toBeDefined();
            } finally {
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('startNewContext event listener should track pages', async () => {
            const browser = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser);
                await BrowserInstance.startNewContext();
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                const initialPagesCount = contextInstance.pages.length;
                
                await BrowserInstance.startNewPage();
                
                expect(contextInstance.pages.length).toBeGreaterThan(initialPagesCount);
            } finally {
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });

        test('startNewContext event listener should set previousPage', async () => {
            const browser = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser);
                await BrowserInstance.startNewContext();
                await BrowserInstance.startNewPage();
                
                await BrowserInstance.startNewPage();
                
                const contextInstance = BrowserInstance['_currentContext'] as Context;
                expect(contextInstance.previousPage).toBeDefined();
            } finally {
                await browser.close();
                // Clean up after test
                BrowserInstance.browser = undefined;
                BrowserInstance.currentContext = undefined;
                BrowserInstance.currentPage = undefined;
            }
        });
    });
});
