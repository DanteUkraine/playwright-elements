import { Locator } from '@playwright/test';
import { WebElement, expect, $, test } from '../src/index.ts';

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
            ? () => (this as any).utils.matcherHint(assertionName, undefined, undefined, { isNot: (this as any).isNot }) +
                '\n\n' +
                `Locator: ${locator}\n` +
                `Expected: ${(this as any).isNot ? 'not' : ''}${(this as any).utils.printExpected(expected)}\n` +
                (matcherResult ? `Received: ${(this as any).utils.printReceived(matcherResult.actual)}` : '')
            : () =>  (this as any).utils.matcherHint(assertionName, undefined, undefined, { isNot: (this as any).isNot }) +
                '\n\n' +
                `Locator: ${locator}\n` +
                `Expected: ${(this as any).utils.printExpected(expected)}\n` +
                (matcherResult ? `Received: ${(this as any).utils.printReceived(matcherResult.actual)}` : '');

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
            await header.expect().not.toHaveAriaLabel('Many');
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
