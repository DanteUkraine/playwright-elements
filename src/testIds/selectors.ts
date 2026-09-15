/**
 * Test ID Selectors Module
 * 
 * This module provides Playwright-compatible selectors that work seamlessly
 * with the TestId and IdFactory types from the builder module.
 * 
 * @packageDocumentation
 */

import { $ } from '../web.element';
import type { IdFactory, TestId } from './builder';

/**
 * Configurable test ID attribute name.
 * Defaults to 'data-testid' (matching Playwright's default).
 * Updated at runtime by the testIdAttributeBridge fixture, which reads
 * `use.testIdAttribute` from the Playwright config.
 */
let configuredTestIdAttribute = 'data-testid';

/**
 * Sets the test ID attribute name used by the $byTestId* selector functions.
 * Called automatically by the testIdAttributeBridge fixture in playwright.test.fixtures.ts
 * to sync with `use.testIdAttribute` from the Playwright config.
 *
 * @param attr - The HTML attribute name (e.g. 'data-testid', 'data-pw')
 */
export const setTestIdAttribute = (attr: string): void => {
  configuredTestIdAttribute = attr;
};

/**
 * Returns the currently configured test ID attribute name.
 */
export const getTestIdAttribute = (): string => configuredTestIdAttribute;

/**
 * Creates a WebElement that matches an element with an exact data-testid value.
 * This selector builds a CSS attribute selector (`[data-testid="..."`]) rather than
 * using Playwright's `getByTestId`, which is important because:
 * 
 * 1. Some tests pass an element's `.selector` string into `page.locator()`
 * 2. `$getByTestId('foo').selector` returns the bare id `'foo'`, which
 *    `page.locator('foo')` misreads as a `<foo>` tag selector
 * 3. The CSS form yields `'[data-testid="foo"]'`, which resolves correctly
 * 
 * Exact-match semantics are identical to Playwright's `getByTestId`.
 * 
 * The attribute name defaults to `data-testid` but can be overridden:
 * - Globally via `use.testIdAttribute` in the Playwright config (applied automatically
 *   by the testIdAttributeBridge fixture)
 * - Per-call via the `attr` parameter
 * 
 * @example
 * ```typescript
 * import { $byTestId, sid } from 'playwright-elements';
 * 
 * // Simple string ID
 * const button = $byTestId(sid('submit-button'));
 * 
 * // Typed TestId
 * const header = $byTestId(sid<'header'>('main-header'));
 * 
 * // Custom attribute (overrides config)
 * const button = $byTestId(sid('submit-button'), 'data-pw');
 * 
 * // Usage in page object
 * export const loginPage = {
 *   usernameField: $byTestId(sid('username-input')),
 *   passwordField: $byTestId(sid('password-input')),
 *   submitButton: $byTestId(sid('submit-button')),
 * };
 * ```
 * 
 * @param id - The test ID to match
 * @param attr - Optional attribute name (defaults to configured testIdAttribute or 'data-testid')
 * @returns A WebElement that matches elements with the exact test id attribute value
 */
export const $byTestId = <K extends string>(id: TestId<K>, attr?: string): ReturnType<typeof $> =>
  $(`[${attr ?? configuredTestIdAttribute}=${escapeForCssAttribute(id as string)}]`);

/**
 * Escapes special characters for use in CSS attribute selectors.
 * Quotes the value and escapes " and \ characters.
 */
const escapeForCssAttribute = (value: string): string => {
  // Escape backslashes and quotes, then wrap in quotes
  return `"${value.replace(/["\\]/g, '\\$&')}"`;
};

/**
 * Creates a WebElement that matches any element whose `data-testid` starts with
 * the factory's prefix. Use this when scoping by ID within a parent or when
 * working with collections of dynamically-generated IDs.
 * 
 * Note: This selector matches on prefix + '-', so factory('btn') will match
 * 'btn-submit' but not 'btnSubmit' or a static id 'btntest'.
 * 
 * **Warning:** Does not accept `bareFactory()` instances (which have empty prefix).
 * Use `factory()` to create a factory with a non-empty prefix.
 * 
 * @example
 * ```typescript
 * import { $byTestIdPrefix, factory } from 'playwright-elements';
 * 
 * // Create a factory for rule row IDs
 * const ruleRow = factory<'rules.row'>('rule-row');
 * 
 * // Select all rule rows
 * const allRows = $byTestIdPrefix(ruleRow);
 * // Produces: $('[data-testid^="rule-row-"]')
 * 
 * // Custom attribute (overrides config)
 * const allRows = $byTestIdPrefix(ruleRow, 'data-pw');
 * 
 * // Usage in page object
 * export const rulesList = {
 *   allRows: $byTestIdPrefix(ruleRow),
 *   
 *   // Get a specific row by filtering
 *   getRow: (ruleId: string) => allRows.filter({ hasText: ruleId }),
 * };
 * ```
 * 
 * @param factory - An IdFactory with a non-empty prefix (not bareFactory)
 * @param attr - Optional attribute name (defaults to configured testIdAttribute or 'data-testid')
 * @returns A WebElement that matches elements with test id attribute starting with the prefix
 * @throws Error if the factory has an empty prefix
 */
export const $byTestIdPrefix = <K extends string>(factory: IdFactory<K>, attr?: string): ReturnType<typeof $> => {
  if (!factory.prefix) {
    throw new Error('$byTestIdPrefix requires a factory with a non-empty prefix');
  }

  // Use prefix + '-' to match exactly what factory() produces, preventing collisions
  // with static IDs that share the prefix (e.g., factory('idx-consent') shouldn't match 'idx-consents')
  const prefixWithDelimiter = `${factory.prefix}-`;
  return $(`[${attr ?? configuredTestIdAttribute}^=${escapeForCssAttribute(prefixWithDelimiter)}]`);
};

/**
 * Creates a WebElement that matches any element whose `data-testid` contains
 * the specified substring. Useful for matching IDs that follow a pattern but
 * have variable parts in the middle.
 * 
 * @example
 * ```typescript
 * import { $byTestIdContaining } from 'playwright-elements';
 * 
 * // Match any ID containing 'user'
 * const userElements = $byTestIdContaining('user');
 * // Produces: $('[data-testid*="user"]')
 * 
 * // Custom attribute (overrides config)
 * const userElements = $byTestIdContaining('user', 'data-pw');
 * ```
 * 
 * @param substring - The substring to match within test id attribute values
 * @param attr - Optional attribute name (defaults to configured testIdAttribute or 'data-testid')
 * @returns A WebElement that matches elements with test id attribute containing the substring
 */
export const $byTestIdContaining = (substring: string, attr?: string): ReturnType<typeof $> =>
  ($(`[${attr ?? configuredTestIdAttribute}*=${escapeForCssAttribute(substring)}]`));

/**
 * Creates a WebElement that matches any element whose `data-testid` ends with
 * the specified suffix.
 * 
 * @example
 * ```typescript
 * import { $byTestIdEndingWith } from 'playwright-elements';
 * 
 * // Match any ID ending with '-button'
 * const buttons = $byTestIdEndingWith('-button');
 * // Produces: $('[data-testid$="-button"]')
 * 
 * // Custom attribute (overrides config)
 * const buttons = $byTestIdEndingWith('-button', 'data-pw');
 * ```
 * 
 * @param suffix - The suffix to match at the end of test id attribute values
 * @param attr - Optional attribute name (defaults to configured testIdAttribute or 'data-testid')
 * @returns A WebElement that matches elements with test id attribute ending with the suffix
 */
export const $byTestIdEndingWith = (suffix: string, attr?: string): ReturnType<typeof $> =>
  ($(`[${attr ?? configuredTestIdAttribute}$=${escapeForCssAttribute(suffix)}]`));
