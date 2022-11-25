# Playwright-elements
___
Playwright elements helps you to create reusable components and allows lazy initialization.

***Installation:*** `npm install -D playwright-elements`

***IMPORTANT:*** playwright elements is not standalone framework, it requires:
- `playwright-core >= 1.26.x` or `@playwright/test >=1.26.x` to added to project.
- `WebElement, $ and BrowserInstance` api require `playwright-core` as dependency. 
- `test` import and fixtures `goto`, `currentPageInstance`. Asserts `WebElement.expect()` api require `@playwright/test` as dependency

___
### Detailed documentation
#### [Web Element](/docs/web.element.md) | [Browser Instance](/docs/browser.instance.md) | [Playwright Test fixtures](/docs/playwright.test.fixtures.md)
___
## WebElement 

No need to pass instance of page into your page object. 
```ts
import {$} from "playwright-elements";

class MainPage {
    readonly header = $(`.navbar`);
}
```
Each element which was created by **$** function returns instance of WebElement so code may look next:
```ts
import {$, WebElement} from "playwright-elements";

class MainPage {
    readonly header: WebElement = $(`.navbar`);
}
```
**$** function is just a shortcut for **new WebElement('.navbar');**


Each WebElement can have sub elements. 
**subElements({logo: $('.navbar__title')})** returns type intersection.
```ts
import {$, WebElement} from "playwright-elements";

type Header = WebElement & { logo: WebElement }

class MainPage {
    readonly header: Header = $(`.navbar`)
        .subElements({
            logo: $(`.navbar__title`)
        });
}
```

___
## Usage with playwright-test

Playwright elements provides you with extended **test** annotation 
and access to playwright expect methods via **expect()** function
```ts
import {test} from "playwright-elements";
import {MainPage} from "main.page"

test.describe(`Playwright test integration`, () => {

    test(`expect positive`, async () => {
        const mainPage = new MainPage();
        await mainPage.header.logo.expect().toBeVisible();
        await mainPage.header.logo.expect().toHaveText("Playwright");
    })

})
```
`playwright.config.ts`:
```ts
import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    use: {
        baseURL: 'https://playwright.dev',
    }
};
export default config;
```
Custom ***test*** annotation will check if **baseURL** is set in playwright config 
and if yes will perform *goto* method from *page*.

WebElement provide access to Locator api via getter `locator` or shortcut `_`:

```ts
import {test} from "playwright-elements";
import {MainPage} from "main.page"

test.describe(`Playwright test integration`, () => {

    test(`expect positive`, async () => {
        const mainPage = new MainPage();
        // Both lines do the same.
        await mainPage.header.logo.locator.click(); 
        await mainPage.header.logo._.click();
    })
})
```
___
Init desktop or mobile version of web element

```ts
import {test, $, initDesktopOrMobile} from "playwright-elements";
import {devices} from "@playwright/test";

test.describe(`Playwright test integration`, () => {

    test.use({...devices['iPhone 13']})
    test(`expect positive`, async () => {
        const mobileHeader = $(`.mobileNavBar`);
        const desktopHeader = $(`.navBar`);
        // initDesktopOrMobile will check isMobile flag and return proper element
        // Also it will check if bouth objects belongs to the same type or interface  
        const element = initDesktopOrMobile(desktopHeader, mobileHeader);
    })
})
```
