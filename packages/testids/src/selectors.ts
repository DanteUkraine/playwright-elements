/**
 * String Selector Builders (zero-dependency)
 *
 * These functions produce CSS attribute selector strings for test-id attributes.
 * They have NO Playwright dependency and can be used in any environment:
 * vitest + jsdom unit tests, application runtime code, or Playwright e2e specs.
 *
 * R1: selectors are NEVER stripped. They READ an attribute, they do not emit one,
 * and the id VALUE is identical in every mode. This is what lets a unit test,
 * a runtime query and an e2e spec share one selector builder.
 *
 * A7: the read side accepts a plain string, so foreign registries can use these
 * selectors without an `unsafeId` escape hatch or brand migration.
 *
 * @packageDocumentation
 */

import { testIds, quote } from './strippable';
import type { TestId, IdFactory } from './builder';

/**
 * Builds a CSS attribute selector for an exact data-testid match.
 *
 * @example
 * ```typescript
 * // In a vitest + jsdom test (NO Playwright installed):
 * import { testIdSelector, sid } from '@playwright-elements/testids';
 *
 * container.querySelector(testIdSelector(sid('submit-button')));
 * // -> container.querySelector('[data-testid="submit-button"]')
 * ```
 *
 * @param id - The test ID (branded TestId or plain string)
 * @param attr - Optional attribute name (defaults to 'data-testid')
 * @returns CSS attribute selector string, e.g. `[data-testid="value"]`
 */
export const testIdSelector = (id: TestId | string, attr?: string): string =>
  attr ? `[${attr}=${quote(id as string)}]` : testIds.selector(id);

/**
 * Builds a CSS attribute selector matching a factory prefix.
 * The selector uses `prefix + '-'` to match exactly what `factory()` produces.
 *
 * @example
 * ```typescript
 * import { testIdPrefixSelector, factory } from '@playwright-elements/testids';
 *
 * const btn = factory('btn');
 * testIdPrefixSelector(btn);  // '[data-testid^="btn-"]'
 * ```
 *
 * @param factory - An IdFactory with a non-empty prefix
 * @param attr - Optional attribute name (defaults to 'data-testid')
 * @returns CSS attribute selector string, e.g. `[data-testid^="prefix-"]`
 * @throws Error if the factory has an empty prefix
 */
export const testIdPrefixSelector = (factory: IdFactory, attr?: string): string => {
  if (!factory.prefix) {
    throw new Error(
      `${attr ?? 'data-testid'}: prefixSelector requires a non-empty prefix`,
    );
  }
  const quoted = quote(`${factory.prefix}-`);
  return `[${attr ?? 'data-testid'}^=${quoted}]`;
};

/**
 * Builds a CSS attribute selector matching any test ID containing a substring.
 *
 * @example
 * ```typescript
 * import { testIdContainsSelector } from '@playwright-elements/testids';
 *
 * testIdContainsSelector('user');  // '[data-testid*="user"]'
 * ```
 *
 * @param fragment - The substring to match
 * @param attr - Optional attribute name (defaults to 'data-testid')
 * @returns CSS attribute selector string
 */
export const testIdContainsSelector = (fragment: string, attr?: string): string =>
  `[${attr ?? 'data-testid'}*=${quote(fragment)}]`;

/**
 * Builds a CSS attribute selector matching any test ID ending with a suffix.
 *
 * @example
 * ```typescript
 * import { testIdEndsWithSelector } from '@playwright-elements/testids';
 *
 * testIdEndsWithSelector('-button');  // '[data-testid$="-button"]'
 * ```
 *
 * @param suffix - The suffix to match
 * @param attr - Optional attribute name (defaults to 'data-testid')
 * @returns CSS attribute selector string
 */
export const testIdEndsWithSelector = (suffix: string, attr?: string): string =>
  `[${attr ?? 'data-testid'}$=${quote(suffix)}]`;
