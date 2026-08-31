import { BrowserInstance } from '../src';
import { test, expect } from '../src';
import { webkit } from 'playwright-core';
import { localFilePath } from './utils';

test.describe('Browser Instance', () => {

    test.describe('start', () => {

        test('should work with default browser', async () => {
            expect(() => BrowserInstance.browser).not.toThrow();
            expect(() => BrowserInstance.currentContext).not.toThrow();
            expect(() => BrowserInstance.currentPage).not.toThrow();
        });


    })

    test.describe('method', () => {
        test(`switch to previous tab`, async ({ goto }) => {
            await goto(localFilePath);
            
            const previousPage = BrowserInstance.currentPage;
            const newPage = await BrowserInstance.startNewPage();
            await newPage.goto('about:blank');
            
            expect(BrowserInstance.currentPage).toBe(newPage);
            expect(BrowserInstance.currentPage.url()).toBe('about:blank');
            
            await BrowserInstance.switchToPreviousTab();
            
            expect(BrowserInstance.currentPage).toBe(previousPage);
            expect(BrowserInstance.currentPage.url()).toContain('test.html');
            
            await newPage.close();
        })

        test(`switch tab by index`, async ({ goto }) => {
            await goto(localFilePath);
            const originalPage = BrowserInstance.currentPage;
            
            const newPage = await BrowserInstance.startNewPage();
            await newPage.goto('about:blank');
            
            expect(BrowserInstance.currentPage).toBe(newPage);
            expect(BrowserInstance.currentPage.url()).toBe('about:blank');
            
            await BrowserInstance.switchToTabByIndex(0);
            
            expect(BrowserInstance.currentPage).toBe(originalPage);
            expect(BrowserInstance.currentPage.url()).toContain('test.html');
            
            await newPage.close();
        })

        test(`switch tab by defunct index`, async ({ goto }) => {
            await goto(localFilePath);
            
            const newPage = await BrowserInstance.startNewPage();
            await newPage.goto('about:blank');
            
            await expect(BrowserInstance.switchToTabByIndex(5))
                .rejects
                .toThrow('Page was not started');
            
            await newPage.close();
        })
    })

    test.describe('setter', () => {
        // These tests manually manage browser lifecycle and don't use fixtures
        // to avoid conflicts with BrowserInstance singleton state

        test(`page`, async () => {
            BrowserInstance.browser = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.currentPage = undefined;
            
            const browser = await webkit.launch();
            const testPage = await browser.newPage();
            BrowserInstance.withPage(testPage);
            expect(() => BrowserInstance.browser).not.toThrow();
            expect(() => BrowserInstance.currentContext).not.toThrow();
            expect(() => BrowserInstance.currentPage).not.toThrow();
            await browser.close();
            
            BrowserInstance.browser = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.currentPage = undefined;
        });

        test(`context`, async () => {
            BrowserInstance.browser = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.currentPage = undefined;
            
            const browser = await webkit.launch();
            const context = await browser.newContext();
            BrowserInstance.withContext(context);
            expect(() => BrowserInstance.browser).not.toThrow();
            expect(() => BrowserInstance.currentContext).not.toThrow();
            await browser.close();
            
            BrowserInstance.browser = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.currentPage = undefined;
        });

        test(`browser`, async () => {
            BrowserInstance.browser = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.currentPage = undefined;
            
            const browser = await webkit.launch();
            BrowserInstance.withBrowser(browser);
            expect(() => BrowserInstance.browser).not.toThrow();
            await browser.close();
            
            BrowserInstance.browser = undefined;
            BrowserInstance.currentContext = undefined;
            BrowserInstance.currentPage = undefined;
        });
    })
})

test.describe('Browser Instance getter', () => {

    test.beforeEach(async () => {
        BrowserInstance.browser = undefined;
        BrowserInstance.currentContext = undefined;
        BrowserInstance.currentPage = undefined;
    })

    test(`browser should throw error`, () => {
        expect(() => BrowserInstance.browser).toThrow(/Browser was not started/);
    })

    test(`start new context should throw error`, async () => {
        await expect(BrowserInstance.startNewContext())
            .rejects
            .toThrow('Browser was not started');
    })

    test(`start new page should throw error`, async () => {
        await expect(BrowserInstance.startNewPage())
            .rejects
            .toThrow('Browser was not started');
    })

    test(`context should throw error`, () => {
        expect(() => BrowserInstance.currentContext).toThrow(/Context was not started/);
    })

    test(`page should throw error`, () => {
        expect(() => BrowserInstance.currentPage).toThrow(/Page was not started/);
    })
})
