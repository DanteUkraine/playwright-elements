import {BrowserInstance, BrowserName} from "../src";
import {expect} from "chai";
import {afterEach, test} from "mocha";

describe('Browser Instance start', function (this: Mocha.Suite) {
    this.timeout(10000);

    afterEach(async () => {
        await BrowserInstance.close();
    })

    const browsers = Object.values(BrowserName);
    for (const browser of browsers) {
        test(`${browser} should start`, async () => {
            await BrowserInstance.start(browser);
            await BrowserInstance.startNewContext();
            await BrowserInstance.startNewPage();
            expect(BrowserInstance.browser).not.to.throw;
            expect(BrowserInstance.currentContext).not.to.throw;
            expect(BrowserInstance.currentPage).not.to.throw;
        })
    }

    test(`new page should start context`, async () => {
        await BrowserInstance.start(BrowserName.CHROMIUM);
        await BrowserInstance.startNewPage();
        expect(BrowserInstance.browser).not.to.throw;
        expect(BrowserInstance.currentContext).not.to.throw;
        expect(BrowserInstance.currentPage).not.to.throw;
    })

})

describe('Browser Instance getter', () => {

    test(`browser should throw error`, () => {
        let errorMessage: string | undefined;
        try {
            BrowserInstance.browser;
        } catch (e) {
            errorMessage = (e as Error).message;
        }
        expect(errorMessage).to.be.equal(`Browser was not started`);
    })

    test(`context should throw error`, () => {
        let errorMessage: string | undefined;
        try {
            BrowserInstance.currentContext;
        } catch (e) {
            errorMessage = (e as Error).message;
        }
        expect(errorMessage).to.be.equal(`Context was not started`);
    })

    test(`page should throw error`, () => {
        let errorMessage: string | undefined;
        try {
            BrowserInstance.currentPage;
        } catch (e) {
            errorMessage = (e as Error).message;
        }
        expect(errorMessage).to.be.equal(`Page was not started`);
    })

})
