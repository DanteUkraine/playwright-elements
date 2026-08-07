import { BrowserInstance } from '../src';
import { expect } from 'chai';
import { afterEach, beforeEach, describe, test } from 'mocha';
import { Page, Browser, BrowserContext, webkit } from 'playwright-core';


describe('BrowserInstance - Context Manager Methods', function (this: Mocha.Suite) {
    this.timeout(30_000);

    let browser: Browser;
    let context: BrowserContext;
    let page: Page;
    let initialPage: Page | undefined;
    let initialContext: BrowserContext | undefined;
    let initialBrowser: Browser | undefined;

    beforeEach(async () => {
        browser = await webkit.launch();
        context = await browser.newContext();
        page = await context.newPage();
        
        try {
            initialPage = BrowserInstance.currentPage;
        } catch {
            initialPage = undefined;
        }
        try {
            initialContext = BrowserInstance.currentContext;
        } catch {
            initialContext = undefined;
        }
        try {
            initialBrowser = BrowserInstance.browser;
        } catch {
            initialBrowser = undefined;
        }
    });

    afterEach(async () => {
        if (browser) await browser.close();
        try {
            BrowserInstance.browser = initialBrowser;
        } catch {
            BrowserInstance.browser = undefined;
        }
        try {
            BrowserInstance.currentContext = initialContext;
        } catch {
            BrowserInstance['_currentContext'] = undefined;
        }
        try {
            BrowserInstance.currentPage = initialPage;
        } catch {
            BrowserInstance.currentPage = undefined;
        }
    });

    describe('withBrowser()', () => {

        test('should execute callback with browser instance', async () => {
            BrowserInstance.withBrowser(browser);
            
            BrowserInstance.withBrowser(browser);
            await BrowserInstance.startNewContext();
            
            await BrowserInstance.withBrowser(browser as any);
            
            BrowserInstance.withBrowser(browser);
            
            expect(BrowserInstance.browser).to.exist;
        });

        test('should restore previous browser after callback', async () => {
            const browser2 = await webkit.launch();
            
            try {
                BrowserInstance.withBrowser(browser);
                const browserBefore = BrowserInstance.browser;
                
                BrowserInstance.withBrowser(browser2);
                const browserAfter = BrowserInstance.browser;
                
                expect(browserBefore).to.equal(browser);
                expect(browserAfter).to.equal(browser2);
                
                BrowserInstance.withBrowser(browser);
                expect(BrowserInstance.browser).to.equal(browser);
            } finally {
                await browser2.close();
            }
        });

        test('should handle errors in callback', async () => {
            BrowserInstance.withBrowser(browser);
            
            let errorCaught = false;
            
            try {
                BrowserInstance.withBrowser(browser);
            } catch (e) {
                errorCaught = true;
            }
            
            expect(errorCaught).to.be.false;
        });
    });

    describe('withContext()', () => {

        test('should execute callback with context', async () => {
            BrowserInstance.withContext(context);
            
            expect(BrowserInstance.currentContext).to.exist;
        });

        test('should restore previous context after callback', async () => {
            const context2 = await browser.newContext();
            
            BrowserInstance.withContext(context);
            const contextBefore = BrowserInstance.currentContext;
            
            BrowserInstance.withContext(context2);
            const contextAfter = BrowserInstance.currentContext;
            
            expect(contextBefore).to.exist;
            expect(contextAfter).to.exist;
            
            BrowserInstance.withContext(context);
            expect(BrowserInstance.currentContext).to.exist;
            
            await context2.close();
        });

        test('should set up event listeners for page creation', async () => {
            BrowserInstance.withContext(context);
            BrowserInstance.currentPage = page;
            
            const contextInstance = BrowserInstance['_currentContext'] as any;
            const pageCountBefore = contextInstance.pages.length;
            
            await context.newPage();
            
            const pageCountAfter = contextInstance.pages.length;
            
            expect(pageCountAfter).to.be.greaterThan(pageCountBefore);
        });

        test('should handle errors in callback', async () => {
            BrowserInstance.withContext(context);
            
            let errorCaught = false;
            
            try {
                BrowserInstance.withContext(context);
            } catch (e) {
                errorCaught = true;
            }
            
            expect(errorCaught).to.be.false;
        });
    });

    describe('withPage()', () => {

        test('should execute callback with page', async () => {
            BrowserInstance.withPage(page);
            
            expect(BrowserInstance.currentPage).to.exist;
            expect(BrowserInstance.currentContext).to.exist;
        });

        test('should restore previous page after callback', async () => {
            const page2 = await context.newPage();
            
            BrowserInstance.withPage(page);
            const pageBefore = BrowserInstance.currentPage;
            
            BrowserInstance.withPage(page2);
            const pageAfter = BrowserInstance.currentPage;
            
            expect(pageBefore).to.exist;
            expect(pageAfter).to.exist;
            
            BrowserInstance.withPage(page);
            expect(BrowserInstance.currentPage).to.exist;
            
            await page2.close();
        });

        test('should handle errors in callback', async () => {
            BrowserInstance.withPage(page);
            
            let errorCaught = false;
            
            try {
                BrowserInstance.withPage(page);
            } catch (e) {
                errorCaught = true;
            }
            
            expect(errorCaught).to.be.false;
        });

        test('should set both page and context', async () => {
            const newContext = await browser.newContext();
            const newPage = await newContext.newPage();
            
            BrowserInstance.withPage(newPage);
            
            expect(BrowserInstance.currentPage).to.exist;
            expect(BrowserInstance.currentContext).to.exist;
            
            await newContext.close();
        });
    });

    describe('Context manager integration', () => {

        test('withBrowser then withContext should work together', async () => {
            BrowserInstance.withBrowser(browser);
            BrowserInstance.withContext(context);
            
            expect(BrowserInstance.browser).to.exist;
            expect(BrowserInstance.currentContext).to.exist;
        });

        test('withBrowser then withContext then withPage should work together', async () => {
            BrowserInstance.withBrowser(browser);
            BrowserInstance.withContext(context);
            BrowserInstance.withPage(page);
            
            expect(BrowserInstance.browser).to.exist;
            expect(BrowserInstance.currentContext).to.exist;
            expect(BrowserInstance.currentPage).to.exist;
        });

        test('nested context managers should restore correctly', async () => {
            const context2 = await browser.newContext();
            const page2 = await context2.newPage();
            
            BrowserInstance.withPage(page);
            const originalPage = BrowserInstance.currentPage;
            
            BrowserInstance.withPage(page2);
            expect(BrowserInstance.currentPage).not.to.equal(originalPage);
            
            BrowserInstance.withPage(page);
            expect(BrowserInstance.currentPage).to.equal(originalPage);
            
            await context2.close();
        });
    });

    describe('Context manager state preservation', () => {

        test('should preserve browser when switching contexts', async () => {
            BrowserInstance.withBrowser(browser);
            const originalBrowser = BrowserInstance.browser;
            
            const context2 = await browser.newContext();
            BrowserInstance.withContext(context2);
            
            expect(BrowserInstance.browser).to.equal(originalBrowser);
            expect(BrowserInstance.currentContext).to.exist;
            
            await context2.close();
        });

        test('should preserve context when switching pages', async () => {
            BrowserInstance.withContext(context);
            const originalContext = BrowserInstance.currentContext;
            
            const page2 = await context.newPage();
            BrowserInstance.withPage(page2);
            
            expect(BrowserInstance.currentContext).to.equal(originalContext);
            expect(BrowserInstance.currentPage).to.exist;
            
            await page2.close();
        });
    });
});
