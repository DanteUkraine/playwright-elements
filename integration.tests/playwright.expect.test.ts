import { Locator } from '@playwright/test';
import { WebElement, expect as baseExpect, $, test } from '../src';


const extendedExpect = baseExpect.extend({
    async toHaveAriaLabel(locator: Locator, expected: string, options?: { timeout?: number }) {
        const assertionName = 'toHaveAmount';
        let pass: boolean;
        let matcherResult: any;
        try {
            await baseExpect(locator).toHaveAttribute('aria-label', expected, options);
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
    },
});

WebElement.useExpect(extendedExpect);

test.describe(`Playwright test integration`, () => {

    test(`custom expect matcher`, async ({ goto }) => {
        await goto('/', { waitUntil: 'domcontentloaded' });
        const header = $(`.navbar`);
        await header.expect().toHaveAriaLabel('Main');
    })
})
