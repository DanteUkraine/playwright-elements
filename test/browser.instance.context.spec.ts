import { BrowserInstance, BrowserName, Context } from '../src';
import { expect } from 'chai';
import { afterEach, beforeEach, describe, test } from 'mocha';
import { webkit, Page, BrowserContext } from 'playwright-core';


describe('BrowserInstance - Context Class', function (this: Mocha.Suite) {
    this.timeout(30_000);

    let browser: any;
    let playwrightContext: BrowserContext;
    let page: Page;

    beforeEach(async () => {
        browser = await webkit.launch();
        playwrightContext = await browser.newContext();
        page = await playwrightContext.newPage();
    });

    afterEach(async () => {
        await browser.close();
        BrowserInstance.browser = undefined;
        BrowserInstance['_currentContext'] = undefined;
        BrowserInstance.currentPage = undefined;
    });

    describe('Context class via withContext()', () => {

        test('should create Context instance with BrowserContext', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            expect(contextInstance).to.exist;
            expect(contextInstance).to.be.instanceOf(Context);
        });

        test('Context.get should return the BrowserContext', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            const browserContext = contextInstance.get;
            
            expect(browserContext).to.exist;
            expect(browserContext).to.equal(playwrightContext);
        });

        test('Context.pages should return all pages in context', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            const pages = contextInstance.pages;
            
            expect(pages).to.be.an('array');
            expect(pages).to.have.lengthOf.at.least(1);
            expect(pages[0]).to.exist;
        });

        test('Context.pages should include newly created pages', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            await playwrightContext.newPage();
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            const pages = contextInstance.pages;
            
            expect(pages).to.be.an('array');
            expect(pages.length).to.be.at.least(2);
        });

        test('Context.isMobile should default to false', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            const isMobile = contextInstance.isMobile;
            
            expect(isMobile).to.be.false;
        });

        test('Context.isMobile should be settable to true', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            contextInstance.isMobile = true;
            
            expect(contextInstance.isMobile).to.be.true;
        });

        test('Context.isMobile should be settable to false', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            contextInstance.isMobile = true;
            contextInstance.isMobile = false;
            
            expect(contextInstance.isMobile).to.be.false;
        });
    });

    describe('Context.previousPage', () => {

        test('should throw error when previousPage not initialized', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            
            expect(() => contextInstance.previousPage).to.throw(Error, 'Previous page was not initialized.');
        });

        test('should set and get previousPage', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            contextInstance.previousPage = page;
            
            expect(contextInstance.previousPage).to.equal(page);
        });

        test('should update previousPage when set multiple times', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            const page2 = await playwrightContext.newPage();
            
            contextInstance.previousPage = page;
            expect(contextInstance.previousPage).to.equal(page);
            
            contextInstance.previousPage = page2;
            expect(contextInstance.previousPage).to.equal(page2);
        });
    });

    describe('Context class integration with BrowserInstance', () => {

        test('BrowserInstance.isContextMobile should reflect Context.isMobile', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            expect(BrowserInstance.isContextMobile).to.be.false;
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            contextInstance.isMobile = true;
            
            expect(BrowserInstance.isContextMobile).to.be.true;
        });

        test('BrowserInstance.isContextMobile should update Context.isMobile', async () => {
            BrowserInstance.withContext(playwrightContext);
            
            BrowserInstance.isContextMobile = true;
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            expect(contextInstance.isMobile).to.be.true;
            
            BrowserInstance.isContextMobile = false;
            expect(contextInstance.isMobile).to.be.false;
        });

        test('withContext should set up page event listeners', async () => {
            BrowserInstance.withContext(playwrightContext);
            BrowserInstance.currentPage = page;
            
            const initialPage = BrowserInstance.currentPage;
            
            await playwrightContext.newPage();
            
            expect(BrowserInstance.currentPage).to.exist;
            expect(BrowserInstance.currentPage).not.to.equal(initialPage);
        });

        test('withContext page event listener should track previous page', async () => {
            BrowserInstance.withContext(playwrightContext);
            BrowserInstance.currentPage = page;
            
            await playwrightContext.newPage();
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            expect(contextInstance.previousPage).to.exist;
        });
    });

    describe('Context class with startNewContext()', () => {

        test('startNewContext should create Context with event listeners', async () => {
            await BrowserInstance.start(BrowserName.WEBKIT);
            await BrowserInstance.startNewContext();
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            expect(contextInstance).to.exist;
            expect(contextInstance).to.be.instanceOf(Context);
            expect(contextInstance.get).to.exist;
        });

        test('startNewContext event listener should track pages', async () => {
            await BrowserInstance.start(BrowserName.WEBKIT);
            await BrowserInstance.startNewContext();
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            const initialPagesCount = contextInstance.pages.length;
            
            await BrowserInstance.startNewPage();
            
            expect(contextInstance.pages.length).to.be.greaterThan(initialPagesCount);
        });

        test('startNewContext event listener should set previousPage', async () => {
            await BrowserInstance.start(BrowserName.WEBKIT);
            await BrowserInstance.startNewContext();
            await BrowserInstance.startNewPage();
            
            await BrowserInstance.startNewPage();
            
            const contextInstance = BrowserInstance['_currentContext'] as Context;
            expect(contextInstance.previousPage).to.exist;
        });
    });
});
