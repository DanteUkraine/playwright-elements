export { BrowserInstance, Context, BrowserName, usePage } from './browser';
export { WebElement, $, $getByAltText, $getByLabel, $getByPlaceholder, $getByRole, $getByTestId, $getByText,
    $getByTitle, initDesktopOrMobile } from './web.element';
export type { ExpectProvider } from './web.element';
export { test, expect } from './playwright.test.fixtures';
export { buildPageObject } from './page.object.builder';
export type { PageObject } from './page.object.builder';
export { generateIndexFile } from './index.generator';
export type { WatcherManager } from './index.generator';
export type { Options as GenerateIndexFileOptions } from './index.generator';
export { createElementAssertions, configureWebElementExpect } from './test.support';

export type {
  TestId,
  IdFactory,
} from './testIds/builder';
export {
  sid,
  factory,
  bareFactory,
  testIdProps,
  isIdFactory,
  unsafeId,
  ns,
  assertNoPrefixCollisions,
} from './testIds/builder';
export {
  $byTestId,
  $byTestIdPrefix,
  $byTestIdContaining,
  $byTestIdEndingWith,
} from './testIds/selectors';
