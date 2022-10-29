import {BrowserInstance, BrowserName} from "../src";
import chai, {expect} from "chai";
import {test} from "mocha";
import {chromium} from "playwright-core";
import chaiAsPromised from 'chai-as-promised'
import * as path from 'path';

const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;


chai.use(chaiAsPromised)

describe('Browser Instance', function (this: Mocha.Suite) {
    this.timeout(15_000);

    describe('start', () => {

        const browsers = Object.values(BrowserName);
        browsers.forEach((browser) => {
            test(`${browser} should start and close`, async () => {
                await BrowserInstance.start(browser);
                await BrowserInstance.startNewContext();
                await BrowserInstance.startNewPage();
                expect(() => BrowserInstance.browser).not.to.throw();
                expect(() => BrowserInstance.currentContext).not.to.throw();
                expect(() => BrowserInstance.currentPage).not.to.throw();
                await BrowserInstance.close();
                expect(() => BrowserInstance.browser).to.throw();
                expect(() => BrowserInstance.currentContext).to.throw();
                expect(() => BrowserInstance.currentPage).to.throw();
            })
        })

        test(`new page should start context`, async () => {
            await BrowserInstance.start(BrowserName.CHROMIUM);
            await BrowserInstance.startNewPage();
            expect(() => BrowserInstance.browser).not.to.throw();
            expect(() => BrowserInstance.currentContext).not.to.throw();
            expect(() => BrowserInstance.currentPage).not.to.throw();
            await BrowserInstance.close();
            expect(() => BrowserInstance.browser).to.throw();
            expect(() => BrowserInstance.currentContext).to.throw();
            expect(() => BrowserInstance.currentPage).to.throw();
        })
    })

    describe('method', function (this: Mocha.Suite) {

        afterEach(async () => {
            await BrowserInstance.close();
        })

        test(`switch tab`, async () => {
            await BrowserInstance.start(BrowserName.CHROMIUM);
            await BrowserInstance.startNewPage();
            await BrowserInstance.currentPage.goto(localFilePath);
            await BrowserInstance.startNewPage();
            expect(BrowserInstance.currentPage.url()).to.be.equal('about:blank');
            await BrowserInstance.switchToPreviousTab();
            expect(BrowserInstance.currentPage.url()).to.contain('test.html');
        })

    })

    describe('setter', () => {

        afterEach(async () => {
            await BrowserInstance.close();
        })

        test(`page`, async () => {
            const browser = await chromium.launch()
            const page = await browser.newPage();
            BrowserInstance.withPage(page);
            expect(() => BrowserInstance.browser).not.to.throw();
            expect(() => BrowserInstance.currentContext).not.to.throw();
            expect(() => BrowserInstance.currentPage).not.to.throw();
        })

        test(`context`, async () => {
            const browser = await chromium.launch()
            const context = await browser.newContext();
            BrowserInstance.withContext(context);
            expect(() => BrowserInstance.browser).not.to.throw();
            expect(() => BrowserInstance.currentContext).not.to.throw();
        })

        test(`browser`, async () => {
            const browser = await chromium.launch()
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

    test(`start new context should throw error`, () => {
        expect(BrowserInstance.startNewContext()).to.be.rejectedWith(Error, `Browser was not started`);
    })

    test(`start new page should throw error`, () => {
        expect(BrowserInstance.startNewPage()).to.be.rejectedWith(Error, `Browser was not started`);
    })

    test(`context should throw error`, () => {
        expect(() => BrowserInstance.currentContext).to.throw(Error, `Context was not started`);
    })

    test(`page should throw error`, () => {
        expect(() => BrowserInstance.currentPage).to.throw(Error, `Page was not started`);
    })

})
