import { expect } from '@playwright/test';
import { WebElement, ExpectProvider, Locator } from '../src/web.element';

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
 * INTERNAL TEST HELPER ONLY - Not part of public API
 * Creates assertion functions for a specific WebElement instance.
 * Used exclusively for testing the library itself.
 */
export function createElementAssertions(element: WebElement): {
    expect: (message?: string) => any;
    softExpect: (message?: string) => any;
} {
    return {
        expect: (message?: string) => expect(element.locator, message),
        softExpect: (message?: string) => expect.soft(element.locator, message)
    };
}

/**
 * INTERNAL TEST HELPER ONLY - Not part of public API
 * Configures WebElement to use Playwright's expect as the assertion provider.
 * Used exclusively for testing the library itself.
 */
export function configureWebElementExpect(): void {
    const provider: ExpectProvider = {
        expect: expect,
        softExpect: expect.soft
    };
    WebElement.setExpectProvider(provider);
}

export type { Locator };
