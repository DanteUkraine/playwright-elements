---
layout: default
title: Get started
---
[Go to Main Page >>](./../README.md)

## Browser Instance
*This object represents single-tone for `Browser`, `BrowserContext` and `Page`.
It allows avoiding pass `page` in your page object.*

- [Browser name](#browser-name)
- [Start](#start)
- [Start new context](#start-new-context)
- [Start new page](#start-new-page)
- [Close browser](#close)
- [Getters and setters](#getters-and-setters)
- [Builder like methods](#builder-like-methods)
- [Switch to previous tab](#switch-to-previous-tab)
- [Switch tab by index](#switch-tab-by-index)

### Browser name
`BrowserName`  is a simple enum with browser names you can install with `npx playwright install` command.
See more in [install browsers docs](https://playwright.dev/docs/cli#install-browsers).

```ts
export enum BrowserName {
    CHROMIUM = 'chromium',
    CHROME = 'chrome',
    CHROME_BETA = 'chrome-beta',
    FIREFOX = 'firefox',
    WEBKIT = 'webkit',
    MSEDGE = 'msedge',
    MSEDGE_BETA = 'msedge-beta',
    MSEDGE_DEV = 'msedge-dev'
}
```
### Start
`start(browserName?: BrowserName, options?: LaunchOptions): Promise<Browser>` method starts new browser
and remembers it, see [Getters and setters](#getters-and-setters).

Args:
- [BrowserName](#browser-name) enum with possible browser names.
- [LunchOptions](https://playwright.dev/docs/api/class-browsertype#browser-type-launch) is a playwright type.

Returns: [Browser](https://playwright.dev/docs/api/class-browser)

Example:
```ts
import { BrowserName, BrowserInstance } from "playwright-elements";

async function useStart() {
    await BrowserInstance.start(BrowserName.CHROME, {headless: fasle});
}
```
### Start new context
`startNewContext(options?: BrowserContextOptions): Promise<BrowserContext>` method starts browser context
and remembers it.

Args:
- [BrowserContextOptions](https://playwright.dev/docs/api/class-browser#browser-new-context)

Returns: [BrowserContext](https://playwright.dev/docs/api/class-browsercontext)

Example:
```ts
import { BrowserName, BrowserInstance } from "playwright-elements";
import { devices } from 'playwright-core';

async function useStartNewContext() {
    await BrowserInstance.start(BrowserName.CHROME, { headless: fasle });
    await BrowserInstance.startNewContext({ ...devices['iPhone 13'] }); 
}
```
### Start new page
`startNewPage(options?: BrowserContextOptions): Promise<Page>` method starts new page or context and page
and remembers them.

Args:
- [BrowserContextOptions](https://playwright.dev/docs/api/class-browser#browser-new-context) methods has
  argument BrowserContextOptions but will use it only if you call this method when context is not started.

Returns: [Page](https://playwright.dev/docs/api/class-page)

Example:
```ts
import { BrowserName, BrowserInstance } from "playwright-elements";
import { devices } from 'playwright-core';

async function useStartNewPage() {
    await BrowserInstance.start(BrowserName.CHROME, { headless: fasle });
    await BrowserInstance.startNewContext({ ...devices['iPhone 13'] });
    await BrowserInstance.startNewPage();
}
```
Or to achieve the same result:
```ts
import { BrowserName, BrowserInstance } from "playwright-elements";
import { devices } from 'playwright-core';

async function useStartNewPage() {
    await BrowserInstance.start(BrowserName.CHROME, { headless: fasle });
    await BrowserInstance.startNewPage({ ...devices['iPhone 13'] });
}
```
### Close
`close(): Promise<void>` method closes browser and removes pointers on `Browser`, `BrowserContext` and `Page`.

Example:
```ts
import { BrowserName, BrowserInstance } from "playwright-elements";
import { devices } from 'playwright-core';

async function useClose() {
    await BrowserInstance.start(BrowserName.CHROME, { headless: fasle });
    await BrowserInstance.startNewPage({ ...devices['iPhone 13'] });
    await BrowserInstance.close();
}
```
### Getters and setters

`get currentPage(): Pag` returns instance of [Page](https://playwright.dev/docs/api/class-page)

`set currentPage(page: Page | undefined)` sets instance of page or undefined if you need to remove pointer.

`get currentContext(): BrowserContext` returns instance of [BrowserContext](https://playwright.dev/docs/api/class-browsercontext)

`set currentContext(context: BrowserContext | undefined)` sets instance of browser context or undefined if you need to remove pointer.

`get browser(): Browser` returns instance of [Browser](https://playwright.dev/docs/api/class-browser)

`set browser(browser: Browser | undefined)` sets instance of browser or undefined if you need to remove pointer.

Examples:

*Getters:*
```ts
import { BrowserName, BrowserInstance } from "playwright-elements";
import { devices, Browser, BrowserContext, Page, BrowserContext } from 'playwright-core';

async function useGetters() {
    await BrowserInstance.start(BrowserName.CHROME, {headless: fasle});
    await BrowserInstance.startNewPage({...devices['iPhone 13']});
    const browser: Browser = BrowserInstance.browser;
    const context: BrowserContext = BrowserInstance.currentContext;
    const page: Page = BrowserInstance.currentPage;
}
```
*Setters:*
```ts
import { BrowserInstance } from "playwright-elements";
import { webkit } from 'playwright-core';

async function useSetters() {
    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    BrowserInstance.browser = browser;
    BrowserInstance.currentContext = context;
    BrowserInstance.currentPage = page;
}
```
### Is mobile context
`get isContextMobile(): boolean` to check if current context was set to mobile config
`set isContextMobile(isMobile: boolean)` allow you to override default logic. By default, this setter is used
in initBrowserInstance auto fixture and just store `isMobile` fixture state from playwright test.

```ts
import { test, BrowserInstance } from "playwright-elements";
import { devices } from "@playwright/test";

test.describe(`Mobile tests`, () => {
    test.use({...devices['iPhone 13']})
    test(`expect positive`, () => {
        BrowserInstance.isContextMobile // returns true
    })
})

test.describe(`Desktop tests`, () => {
    test.use({...devices['Desktop Chrome']})
    test(`expect positive`, () => {
        BrowserInstance.isContextMobile // returns false
    })
})
```

### Builder like methods

`withBrowser(browser: Browser): void` sets instance of browser.

`withContext(context: BrowserContext): void` sets instances of browser context and browser.

`withPage(page: Page): void` sets instances of page, browser context and browser.

Examples:

*withBrowser sets only browser instance:*
```ts
import { BrowserInstance } from "playwright-elements";
import { webkit } from 'playwright-core';

async function useWithBrowser() {
    BrowserInstance.withBrowser(await webkit.launch());
    const browser = BrowserInstance.browser;
}
```
*withContext sets context and browser instances:*
```ts
import { BrowserInstance } from "playwright-elements";
import { webkit } from 'playwright-core';

async function useWithBrowser() {
    const browser = await webkit.launch();
    const context = await browser.newContext();
    BrowserInstance.withContext(browser);
    const storedContext = BrowserInstance.currentContext;
    const storedBrowser = BrowserInstance.browser;
}
```
*withPage sets page, context and browser instances:*
```ts
import { BrowserInstance } from "playwright-elements";
import { webkit } from 'playwright-core';

async function useWithBrowser() {
    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    BrowserInstance.withPage(page);
    const storedPage = BrowserInstance.currentPage;
    const storedContext = BrowserInstance.currentContext;
    const storedBrowser = BrowserInstance.browser;
}
```
### Switch to previous tab

`switchToPreviousTab(): Promise<void>` when new page is opened `BrowserInstance` stores pointer on previous one,
this method with set previous page as currentPage and call [bring to front](https://playwright.dev/docs/api/class-page#page-bring-to-front) function.

Example:
```ts
import { BrowserName, BrowserInstance, expect } from "playwright-elements";

async function useSwitchToPreviousTab() {
    await BrowserInstance.start(BrowserName.WEBKIT);
    await BrowserInstance.startNewPage();
    await BrowserInstance.currentPage.goto(`https://playwright.dev`);
    await BrowserInstance.startNewPage();
    expect(BrowserInstance.currentPage).toHaveURL('about:blank');
    await BrowserInstance.switchToPreviousTab();
    expect(BrowserInstance.currentPage).toHaveURL('https://playwright.dev');
}
```

### Switch tab by index

`switchToTabByIndex(): Promise<void>` when new page is opened `BrowserInstance` stores pointer on previous one,
this method with set page with specific index as currentPage and call [bring to front](https://playwright.dev/docs/api/class-page#page-bring-to-front) function.

Example:
```ts
import { BrowserName, BrowserInstance, expect } from "playwright-elements";

async function useSwitchToTabByIndex() {
    await BrowserInstance.start(BrowserName.WEBKIT);
    await BrowserInstance.startNewPage();
    await BrowserInstance.currentPage.goto(`https://playwright.dev`);
    await BrowserInstance.startNewPage();
    expect(BrowserInstance.currentPage).toHaveURL('about:blank');
    await BrowserInstance.switchToTabByIndex(0);
    expect(BrowserInstance.currentPage).toHaveURL('https://playwright.dev');
}
```

[Go to Main Page >>](./../README.md)
