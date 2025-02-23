---
layout: default
title: Get started
---
[Go to Main Page >>](./../README.md)

## Get started

You do not need to pass the page instance into your page object.

_./pages/index.ts_
```ts
import { $ } from 'playwright-elements';

export class MainPage {
    readonly header = $('.navbar');
}
```

Each element created using the **$** function returns an instance of WebElement. Your code can also be written as:

_./pages/index.ts_
```ts
import { $, WebElement } from 'playwright-elements';

export class MainPage {
    readonly header: WebElement = $('.navbar');
}
```

The **$** function is simply a shortcut for  **new WebElement('.navbar');**

Each WebElement can have sub-elements, and child elements can have sub-elements as well.
**subElements({logo: $('.navbar__title')})** or **with({logo: $('.navbar__title')})** returns type intersection.

_./pages/index.ts_
```ts
import { $, WebElement } from 'playwright-elements';

type Header = WebElement & { logo: WebElement }

export class MainPage {
    readonly header: Header = $('.navbar')
        .with({
            logo: $('.navbar__title'),
            githubLogo: $('a[aria-label="GitHub repository"]')
        });
}
```

Several elements deep structure:

_./pages/index.ts_
```ts
import { $, WebElement } from 'playwright-elements';

type Table = WebElement & { thead: Webelement }

export class MainPage {
    readonly table = $('table')
        .with({
            columnHeaders: $('thead td'),
            rows: $('tbody tr')
                    .with({
                        cells: $('td')
                    })
        });
}
```

Sub elements and custom methods:

_./pages/index.ts_
```ts
import { $, WebElement } from 'playwright-elements';

type Table = WebElement & { thead: Webelement }

export class MainPage {
    readonly table = $('table')
        .with({
            columnHeaders: $('thead td'),
            rows: $('tbody tr')
                    .with({
                        cells: $('td')
                    }),
            async someCustomMethod(this: WebElement) {
                //...
            }
        });
}
```

Type-Safe Fixture Setup:

_./fixtures.ts_
```ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import { createIndexFile } from '../src/index';
import * as pageObjectModule from './pages';

// Generate an index files recursively in the specified folder or use cli interface.
generateIndexFile('./page.object');

type TestFixtures = { pageObject: PageObject<typeof pageObjectModule> };

export const test = baseTest.extend({
  page: [async ({}, use) => {
    await use(buildPageObject(pageObjectModule));
  }, { scope: 'test' }],
});
```
You can generate index file via CLI [Generate index file](#generate-index-file).

Elements like tables can be called in a chain with different filters to narrow down target
inner elements for assertions or actions.

Usage in test:

_./test.ts_
```ts
import { test } from './fixtures'

test.describe('Invocation chain example', () => {
    
    test('test', async ({ page }) => {
        await page.table.columnHeaders.expect().toHaveText(['ID', 'Name', 'Status']);
        await page.table.rows.hasText('Justin').cells.expect().toHaveText(['123', 'Justin', 'Single']);
    });
    
});
```

## Usage with playwright-test

Playwright elements provides you with extended **test** annotation
which includes [goto](#goto) and [usePage](#fixture-use-page) fixture and access to playwright expect
methods via **expect()** function

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

Pay attention that usage of `buildPageObject` method to return pages in fixture is not mandatory.
```ts
import { test } from 'playwright-elements';
import { MainPage } from 'page.object'

test.describe('Goto fixure example', () => {

  test('expect positive', async ({ goto }) => {
    await goto();
    const mainPage = new MainPage(); // Your page object is imdependent from page instance and from bieng returned from fixtures
    await mainPage.header.logo.expect().toBeVisible();
    await mainPage.header.logo.expect().toHaveText('Playwright');
  })

})
```

`BrowserInstance` will automatically bring to front and switch to opened tab.

```ts
import { test, $, BrowserInstance, expect } from 'playwright-elements';

test.describe('Playwright test integration', () => {
    
    test('Tab swith example', async () => {
      await goto();
      const mainPage = new MainPage();
      await expect(BrowserInstance.currentPage).toHaveURL('https://playwright.dev');
      await mainPage.header.githubLogo.click();
      await expect(BrowserInstance.currentPage).toHaveURL('https://github.com/microsoft/playwright');
      await BrowserInstance.switchToPreviousTab();
      await expect(BrowserInstance.currentPage).toHaveURL('https://playwright.dev');
      await BrowserInstance.switchToTabByIndex(1);
      await expect(BrowserInstance.currentPage).toHaveURL('https://github.com/microsoft/playwright');
    })
})
```

[Go to Main Page >>](./../README.md)
