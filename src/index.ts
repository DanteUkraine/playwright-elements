export { BrowserInstance, Context, BrowserName, usePage } from './browser';
export { WebElement, $, $getByAltText, $getByLabel, $getByPlaceholder, $getByRole, $getByTestId, $getByText,
    $getByTitle, initDesktopOrMobile } from './web.element';
export { test, expect } from './playwright.test.fixtures';
export { buildPageObject } from './page.object.builder';
export type { PageObject } from './page.object.builder';
export { generateIndexFile } from './index.generator';
