/**
 * Test ID Selectors Module
 *
 * The $byTestId* functions are one-line wrappers over the zero-dependency
 * string selector builders from @playwright-elements/testids. This ensures
 * a single source of truth for selector shape (A6, AC7): $byTestId(id)
 * and testIdSelector(id) produce the same CSS string from one implementation.
 *
 * The attribute name defaults to `data-testid` but can be overridden:
 * - Globally via `use.testIdAttribute` in the Playwright config (applied
 *   automatically by the testIdAttributeBridge fixture)
 * - Per-call via the `attr` parameter
 *
 * @packageDocumentation
 */

import { $ } from '../web.element';
import {
  testIdSelector,
  testIdPrefixSelector,
  testIdContainsSelector,
  testIdEndsWithSelector,
} from '@playwright-elements/testids';
import type { TestId, IdFactory } from './builder';

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
 *
 * This is a one-line wrapper over the shared string builder (A6, AC7):
 * `$byTestId(id) === $(testIdSelector(id))`. One source of truth for selector
 * shape instead of two implementations that can drift.
 *
 * Accepts `TestId | string` (A7): foreign registries can use $byTestId without
 * an `unsafeId` escape hatch or brand migration.
 *
 * @example
 * ```typescript
 * import { $byTestId, sid } from 'playwright-elements';
 *
 * const button = $byTestId(sid('submit-button'));
 * const header = $byTestId(sid<'header'>('main-header'));
 * const button = $byTestId('submit-button'); // plain string also works
 * const button = $byTestId(sid('submit-button'), 'data-pw'); // custom attr
 * ```
 *
 * @param id - The test ID (branded TestId or plain string)
 * @param attr - Optional attribute name (defaults to configured testIdAttribute)
 * @returns A WebElement that matches elements with the exact test id attribute value
 */
export const $byTestId = (id: TestId | string, attr?: string): ReturnType<typeof $> =>
  $(testIdSelector(id, attr ?? configuredTestIdAttribute));

/**
 * Creates a WebElement that matches any element whose `data-testid` starts with
 * the factory's prefix.
 *
 * Note: This selector matches on prefix + '-', so factory('btn') will match
 * 'btn-submit' but not 'btnSubmit' or a static id 'btntest'.
 *
 * **Warning:** Does not accept `bareFactory()` instances (which have empty prefix).
 *
 * @example
 * ```typescript
 * import { $byTestIdPrefix, factory } from 'playwright-elements';
 *
 * const ruleRow = factory<'rules.row'>('rule-row');
 * const allRows = $byTestIdPrefix(ruleRow);
 * // Produces: $('[data-testid^="rule-row-"]')
 * ```
 *
 * @param factory - An IdFactory with a non-empty prefix (not bareFactory)
 * @param attr - Optional attribute name (defaults to configured testIdAttribute)
 * @returns A WebElement that matches elements with test id attribute starting with the prefix
 * @throws Error if the factory has an empty prefix
 */
export const $byTestIdPrefix = (factory: IdFactory, attr?: string): ReturnType<typeof $> => {
  if (!factory.prefix) {
    throw new Error('$byTestIdPrefix requires a factory with a non-empty prefix');
  }
  return $(testIdPrefixSelector(factory, attr ?? configuredTestIdAttribute));
};

/**
 * Creates a WebElement that matches any element whose `data-testid` contains
 * the specified substring.
 *
 * @example
 * ```typescript
 * import { $byTestIdContaining } from 'playwright-elements';
 *
 * const userElements = $byTestIdContaining('user');
 * // Produces: $('[data-testid*="user"]')
 * ```
 *
 * @param substring - The substring to match within test id attribute values
 * @param attr - Optional attribute name (defaults to configured testIdAttribute)
 * @returns A WebElement that matches elements with test id attribute containing the substring
 */
export const $byTestIdContaining = (substring: string, attr?: string): ReturnType<typeof $> =>
  $(testIdContainsSelector(substring, attr ?? configuredTestIdAttribute));

/**
 * Creates a WebElement that matches any element whose `data-testid` ends with
 * the specified suffix.
 *
 * @example
 * ```typescript
 * import { $byTestIdEndingWith } from 'playwright-elements';
 *
 * const buttons = $byTestIdEndingWith('-button');
 * // Produces: $('[data-testid$="-button"]')
 * ```
 *
 * @param suffix - The suffix to match at the end of test id attribute values
 * @param attr - Optional attribute name (defaults to configured testIdAttribute)
 * @returns A WebElement that matches elements with test id attribute ending with the suffix
 */
export const $byTestIdEndingWith = (suffix: string, attr?: string): ReturnType<typeof $> =>
  $(testIdEndsWithSelector(suffix, attr ?? configuredTestIdAttribute));
