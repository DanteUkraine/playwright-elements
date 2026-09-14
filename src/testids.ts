/**
 * Zero-dependency entry point for the testIds module.
 * This re-exports only the builder utilities without any Playwright or lodash dependencies.
 * 
 * Use this import path: `playwright-elements/testids`
 * 
 * For selectors ($byTestId, etc.), import from the main entry point or from:
 * `playwright-elements/testIds/selectors`
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
  isIdFactory,
  unsafeId,
  assertNoPrefixCollisions,
} from './testIds/builder';
