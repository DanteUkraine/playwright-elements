import { BrowserInstance, BrowserName } from '../src';
import { AssertionError, expect } from 'chai';
import { afterEach, test } from 'mocha';
import { webkit } from 'playwright-core';
import { localFilePath } from './utils';


describe('Browser Instance', function (this: Mocha.Suite) {
    this.timeout(30_000);

    afterEach(async () => {
        await BrowserInstance.close();
    })

    describe('start', () => {

        const browsers = Object.values(BrowserName);
        for (const browser of browsers) {
            test(`${browser} should start`, async () => {
                await BrowserInstance.start(browser);
                await BrowserInstance.startNewContext();
                await BrowserInstance.startNewPage();
                expect(() => BrowserInstance.browser).not.to.throw();
                expect(() => BrowserInstance.currentContext).not.to.throw();
                expect(() => BrowserInstance.currentPage).not.to.throw();
            })
        }

        test(`new page should start context`, async () => {
            await BrowserInstance.start(BrowserName.WEBKIT);
            await BrowserInstance.startNewPage();
            expect(() => BrowserInstance.browser).not.to.throw();
            expect(() => BrowserInstance.currentContext).not.to.throw();
            expect(() => BrowserInstance.currentPage).not.to.throw();
        })
    })

    describe('method', function (this: Mocha.Suite) {
        beforeEach(async () => {
            await BrowserInstance.start(BrowserName.FIREFOX);
            await BrowserInstance.startNewPage();
            await BrowserInstance.currentPage.goto(localFilePath);
        })

        test(`switch to previous tab`, async () => {
            await BrowserInstance.startNewPage();
            expect(BrowserInstance.currentPage.url()).to.be.equal('about:blank');
            await BrowserInstance.switchToPreviousTab();
            expect(BrowserInstance.currentPage.url()).to.contain('test.html');
        })

        test(`switch tab by index`, async () => {
            await BrowserInstance.startNewPage();
            expect(BrowserInstance.currentPage.url()).to.be.equal('about:blank');
            await BrowserInstance.switchToTabByIndex(0);
            expect(BrowserInstance.currentPage.url()).to.contain('test.html');
        })

        test(`switch tab by defunct index`, async () => {
            const expectedMessage = 'Page was not started';
            await BrowserInstance.startNewPage();
            try {
                await BrowserInstance.switchToTabByIndex(2)
            } catch (e) {
                expect(e).to.have.property('message', expectedMessage);
                return;
            }
            throw new AssertionError(`Error with message: "${expectedMessage}" should be thrown.`)
        })

    })

    describe('setter', () => {

        test(`page`, async () => {
            const browser = await webkit.launch();
            const page = await browser.newPage();
            BrowserInstance.withPage(page);
            expect(() => BrowserInstance.browser).not.to.throw();
            expect(() => BrowserInstance.currentContext).not.to.throw();
            expect(() => BrowserInstance.currentPage).not.to.throw();
        })

        test(`context`, async () => {
            const browser = await webkit.launch();
            const context = await browser.newContext();
            BrowserInstance.withContext(context);
            expect(() => BrowserInstance.browser).not.to.throw();
            expect(() => BrowserInstance.currentContext).not.to.throw();
        })

        test(`browser`, async () => {
            const browser = await webkit.launch();
            BrowserInstance.withBrowser(browser);
            expect(() => BrowserInstance.browser).not.to.throw();
        })
    })
})

describe('Browser Instance getter', () => {

    before(() => {
        BrowserInstance.browser = undefined;
        BrowserInstance.currentContext = undefined;
        BrowserInstance.currentPage = undefined;
    })

    test(`browser should throw error`, () => {
        expect(() => BrowserInstance.browser).to.throw(Error, `Browser was not started`);
    })

    test(`start new context should throw error`, async () => {
        try {
            await BrowserInstance.startNewContext()
        } catch (e) {
            expect(e).to.have.property('message', `Browser was not started`);
            return;
        }
        throw new AssertionError('Error with message: "Browser was not started" should be thrown.')
    })

    test(`start new page should throw error`, async () => {
        try {
            await BrowserInstance.startNewPage()
        } catch (e) {
            expect(e).to.have.property('message', `Browser was not started`);
            return;
        }
        throw new AssertionError('Error with message: "Browser was not started" should be thrown.')
    })

    test(`context should throw error`, () => {
        expect(() => BrowserInstance.currentContext).to.throw(Error, `Context was not started`);
    })

    test(`page should throw error`, () => {
        expect(() => BrowserInstance.currentPage).to.throw(Error, `Page was not started`);
    })
})
