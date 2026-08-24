import { expect } from '@playwright/test';
import { WebElement, ExpectProvider } from './web.element';

/**
 * Type representing the result of expect() call on a WebElement
 * This provides Playwright assertion chaining for test convenience
 */
export type WebElementExpect = {
    toHaveValue: (value: string | RegExp, options?: any) => Promise<void>;
    toBeVisible: (options?: any) => Promise<void>;
    toContainText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveAttribute: (name: string, value: string | RegExp, options?: any) => Promise<void>;
    toBeEnabled: (options?: any) => Promise<void>;
    toBeDisabled: (options?: any) => Promise<void>;
    toBeChecked: (options?: any) => Promise<void>;
    toBeHidden: (options?: any) => Promise<void>;
    toHaveCount: (count: number, options?: any) => Promise<void>;
    toHaveClass: (className: string | RegExp, options?: any) => Promise<void>;
    toHaveId: (id: string, options?: any) => Promise<void>;
    not: WebElementExpect;
};

/**
 * Type representing the result of softExpect() call on a WebElement
 * This provides Playwright soft assertion chaining for test convenience
 */
export type WebElementSoftExpect = {
    toHaveValue: (value: string | RegExp, options?: any) => Promise<void>;
    toBeVisible: (options?: any) => Promise<void>;
    toContainText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveAttribute: (name: string, value: string | RegExp, options?: any) => Promise<void>;
    toBeEnabled: (options?: any) => Promise<void>;
    toBeDisabled: (options?: any) => Promise<void>;
    toBeChecked: (options?: any) => Promise<void>;
    toBeHidden: (options?: any) => Promise<void>;
    toHaveCount: (count: number, options?: any) => Promise<void>;
    not: WebElementSoftExpect;
};

/**
 * Extension methods for WebElement to support assertion chaining.
 * These methods provide convenient access to Playwright's expect API.
 * 
 * NOTE: This module imports from @playwright/test and should only be used
 * in test environments. For production code, use WebElement methods directly.
 */
export function extendWebElementWithAssertions() {
    // This function exists to explicitly load assertion support
    // The actual extension happens through the WebElement class itself
}

/**
 * Assertion adapter that wraps a WebElement's locator with Playwright expect
 * @param element - The WebElement to create assertions for
 * @returns An object with expect and softExpect methods for assertion chaining
 */
export function createElementAssertions(element: WebElement): {
    expect: (message?: string) => any;
    softExpect: (message?: string) => any;
} {
    return {
        /**
         * Creates a Playwright expect assertion chain for this element
         * @param message - Optional message for the assertion
         * @returns Playwright assertion chain for the element's locator
         */
        expect: (message?: string) => expect(element.locator, message),
        
        /**
         * Creates a Playwright soft expect assertion chain for this element
         * Soft assertions do not fail the test immediately, but are collected and reported at the end
         * @param message - Optional message for the assertion
         * @returns Playwright soft assertion chain for the element's locator
         */
        softExpect: (message?: string) => expect.soft(element.locator, message)
    };
}

/**
 * Configures WebElement to use Playwright's expect for assertion chaining.
 * This must be called in your test setup before using element.expect() or element.softExpect().
 * 
 * This function decouples the core WebElement class from @playwright/test by using
 * a provider pattern. The WebElement class itself has no dependency on @playwright/test.
 * 
 * @example
 * ```typescript
 * // In your test setup file (e.g., before hooks)
 * import { configureWebElementExpect } from 'playwright-elements';
 * 
 * // For Playwright Test
 * configureWebElementExpect();
 * 
 * // Now all WebElement instances can use:
 * await myElement.expect().toHaveValue('test');
 * await myElement.softExpect().toBeVisible();
 * ```
 */
export function configureWebElementExpect(): void {
    const provider: ExpectProvider = {
        expect: expect,
        softExpect: expect.soft
    };
    WebElement.setExpectProvider(provider);
}

// Re-export types for external usage
export type { Locator } from 'playwright-core';
