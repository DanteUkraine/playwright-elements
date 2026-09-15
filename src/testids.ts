/**
 * Zero-dependency entry point for the testIds module.
 * This re-exports only the builder utilities without any Playwright or lodash dependencies.
 *
 * Use this import path: `playwright-elements/testids`
 *
 * For selectors ($byTestId, etc.), import from the main entry point or from:
 * `playwright-elements/testIds/selectors`
 *
 * For zero-dep string selectors (no Playwright), import from:
 * `@playwright-elements/testids/selectors`
 */

export type {
  TestId,
  IdFactory,
} from './testIds/builder';

export {
  sid,
  factory,
  bareFactory,
  ns,
  testIdProps,
  testIdValue,
  isIdFactory,
  unsafeId,
  assertNoPrefixCollisions,
} from './testIds/builder';

export {
  createStrippableAttribute,
  createTestIds,
  testIds,
  TEST_IDS_ENABLED,
} from '@playwright-elements/testids';

export type { StrippableAttribute } from '@playwright-elements/testids';

export {
  testIdSelector,
  testIdPrefixSelector,
  testIdContainsSelector,
  testIdEndsWithSelector,
} from '@playwright-elements/testids';
