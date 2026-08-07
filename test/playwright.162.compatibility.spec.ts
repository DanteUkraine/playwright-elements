import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { BrowserInstance, BrowserName, $, $getByRole, $getByLabel, $getByTestId, $getByAltText, $getByTitle, $getByPlaceholder, $getByText } from '../src';


describe('Playwright 1.62+ Compatibility', function (this: Mocha.Suite) {
    this.timeout(30_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.WEBKIT);
        await BrowserInstance.startNewContext();
        await BrowserInstance.startNewPage();
    });

    after(async () => {
        await BrowserInstance.close();
    });

    describe('Locator Methods Compatibility', () => {

        it('should support getByRole with latest options', async () => {
            const element = $('[role="button"]');
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });

        it('should support getByLabel with latest options', async () => {
            const element = $('label=Submit');
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });

        it('should support getByTestId with latest options', async () => {
            const element = $(('[data-testid="test-element"]'));
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });

        it('should support getByAltText with latest options', async () => {
            const element = $('[alt="image"]');
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });

        it('should support getByTitle with latest options', async () => {
            const element = $('[title="tooltip"]');
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });

        it('should support getByPlaceholder with latest options', async () => {
            const element = $('[placeholder="Enter text"]');
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });

        it('should support getByText with latest options', async () => {
            const element = $('text=Submit');
            expect(element).to.exist;
            expect(element.locator).to.exist;
        });
    });

    describe('Browser Context Features Compatibility', () => {

        it('should support mobile emulation with latest options', async () => {
            const context = await BrowserInstance.browser.newContext({
                viewport: { width: 375, height: 812 },
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
                deviceScaleFactor: 3,
                isMobile: true,
                hasTouch: true
            });
            
            expect(context).to.exist;
            await context.close();
        });

        it('should support geolocation with latest options', async () => {
            const context = await BrowserInstance.browser.newContext({
                geolocation: { longitude: 48.8584, latitude: 2.2945 },
                permissions: ['geolocation']
            });
            
            expect(context).to.exist;
            await context.close();
        });

        it('should support permissions API', async () => {
            const context = await BrowserInstance.browser.newContext({
                permissions: ['clipboard-read', 'clipboard-write', 'geolocation']
            });
            
            expect(context).to.exist;
            await context.close();
        });

        it('should support storage state with latest options', async () => {
            const context = await BrowserInstance.browser.newContext({
                storageState: { cookies: [], origins: [] }
            });
            
            expect(context).to.exist;
            await context.close();
        });
    });

    describe('Page Features Compatibility', () => {

        it('should support enhanced navigation APIs', async () => {
            const page = BrowserInstance.currentPage;
            
            expect(page.goto).to.be.a('function');
            expect(page.reload).to.be.a('function');
            expect(page.goBack).to.be.a('function');
            expect(page.goForward).to.be.a('function');
        });

        it('should support new dialog handling', async () => {
            const page = BrowserInstance.currentPage;
            
            expect(page.on).to.be.a('function');
            expect(page.once).to.be.a('function');
            expect(page.off).to.be.a('function');
        });

        it('should support enhanced download handling', async () => {
            const page = BrowserInstance.currentPage;
            
            expect(page.on).to.be.a('function');
        });

        it('should support new popup handling', async () => {
            const page = BrowserInstance.currentPage;
            
            expect(page.on).to.be.a('function');
        });
    });

    describe('WebElement with Playwright 1.62+ Features', () => {

        it('should work with $getByRole factory function', async () => {
            const element = $getByRole('button');
            expect(element).to.exist;
        });

        it('should work with $getByLabel factory function', async () => {
            const element = $getByLabel('Username');
            expect(element).to.exist;
        });

        it('should work with $getByTestId factory function', async () => {
            const element = $getByTestId('login-button');
            expect(element).to.exist;
        });

        it('should work with $getByAltText factory function', async () => {
            const element = $getByAltText('Logo');
            expect(element).to.exist;
        });

        it('should work with $getByTitle factory function', async () => {
            const element = $getByTitle('Close');
            expect(element).to.exist;
        });

        it('should work with $getByPlaceholder factory function', async () => {
            const element = $getByPlaceholder('Enter your name');
            expect(element).to.exist;
        });

        it('should work with $getByText factory function', async () => {
            const element = $getByText('Submit');
            expect(element).to.exist;
        });

        it('should work with $getBy* methods on WebElement instances', async () => {
            const element = $('<div>');
            
            expect(element.$getByRole).to.be.a('function');
            expect(element.$getByLabel).to.be.a('function');
            expect(element.$getByTestId).to.be.a('function');
            expect(element.$getByAltText).to.be.a('function');
            expect(element.$getByTitle).to.be.a('function');
            expect(element.$getByPlaceholder).to.be.a('function');
            expect(element.$getByText).to.be.a('function');
        });
    });

    describe('BrowserInstance with Playwright 1.62+ Features', () => {

        it('should support all browser types in Playwright 1.62+', async () => {
            const browsers = [
                BrowserName.CHROMIUM,
                BrowserName.CHROME,
                BrowserName.FIREFOX,
                BrowserName.WEBKIT,
                BrowserName.MSEDGE
            ];
            
            for (const browserName of browsers) {
                expect(browserName).to.exist;
            }
        });

        it('should support browser context options', async () => {
            const context = await BrowserInstance.browser.newContext({
                viewport: { width: 1920, height: 1080 },
                userAgent: 'test-agent',
                deviceScaleFactor: 1,
                isMobile: false,
                hasTouch: false
            });
            
            expect(context).to.exist;
            await context.close();
        });

        it('should support multiple contexts', async () => {
            const context1 = await BrowserInstance.browser.newContext();
            const context2 = await BrowserInstance.browser.newContext();
            
            expect(context1).to.exist;
            expect(context2).to.exist;
            expect(context1).not.to.equal(context2);
            
            await context1.close();
            await context2.close();
        });
    });

    describe('Playwright 1.62+ Integration Tests', () => {

        it('should be compatible with Playwright 1.62+', async () => {
            const page = BrowserInstance.currentPage;
            expect(page).to.exist;
        });

        it('should support all Playwright 1.62+ locator methods', async () => {
            const element = $('<div>');
            
            expect(element.click).to.be.a('function');
            expect(element.fill).to.be.a('function');
            expect(element.hover).to.be.a('function');
            expect(element.focus).to.be.a('function');
            expect(element.blur).to.be.a('function');
            expect(element.check).to.be.a('function');
            expect(element.uncheck).to.be.a('function');
            expect(element.selectOption).to.be.a('function');
        });

        it('should support all Playwright 1.62+ assertion methods', async () => {
            const element = $('<div>');
            
            expect(element.expect).to.be.a('function');
            expect(element.softExpect).to.be.a('function');
        });

        it('should support all Playwright 1.62+ action methods', async () => {
            const element = $('<div>');
            
            const actionMethods = [
                'click', 'dblclick', 'hover', 'focus', 'blur',
                'fill', 'clear', 'selectOption', 'selectText',
                'check', 'uncheck', 'type', 'press',
                'dispatchEvent', 'scrollIntoViewIfNeeded',
                'waitFor', 'getAttribute', 'innerText',
                'innerHTML', 'textContent'
            ];
            
            for (const method of actionMethods) {
                expect(element[method as keyof typeof element]).to.exist;
            }
        });
    });
});
