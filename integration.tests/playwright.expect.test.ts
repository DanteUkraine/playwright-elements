import { Locator } from '@playwright/test';
import { WebElement, expect, $, test } from '../src';

const customMatchers = {
    async toHaveAriaLabel(locator: Locator, expected: string, options?: { timeout?: number }) {
        const assertionName = 'toHaveAmount';
        let pass: boolean;
        let matcherResult: any;
        try {
            await expect(locator).toHaveAttribute('aria-label', expected, options);
            pass = true;
        } catch (e: any) {
            matcherResult = e.matcherResult;
            pass = false;
        }
        const message = pass
            ? () => this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Locator: ${locator}\n` +
                `Expected: ${this.isNot ? 'not' : ''}${this.utils.printExpected(expected)}\n` +
                (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : '')
            : () =>  this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
                '\n\n' +
                `Locator: ${locator}\n` +
                `Expected: ${this.utils.printExpected(expected)}\n` +
                (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : '');

        return {
            message,
            pass,
            name: assertionName,
            expected,
            actual: matcherResult?.actual,
        };
    }
};

test.describe(`Playwright test integration`, () => {

    test.describe('default web element', () => {

        expect.extend(customMatchers);

        test(`custom expect matcher`, async ({ goto }) => {
            await goto('/', { waitUntil: 'domcontentloaded' });
            const header = $(`.navbar`);
            await header.expect().toHaveAriaLabel('Main');

        })
    });

    test.describe('custom web element', () => {

        const extendedExpect = expect.extend(customMatchers);
        class CustomWebElement extends WebElement {
            public customExpect(message?: string): ReturnType<typeof extendedExpect<Locator>> {
                return extendedExpect(this.locator, message);
            }
        }

        function $(selector: string): CustomWebElement {
            return new CustomWebElement(selector);
        }

        test(`custom expect matcher`, async ({ goto }) => {
            await goto('/', { waitUntil: 'domcontentloaded' });
            const header = $(`.navbar`);
            await header.customExpect().toHaveAriaLabel('Main');
        })
    })

})
