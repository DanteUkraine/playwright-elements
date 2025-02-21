---
layout: default
title: Get started
---
[Go to Main Page >>](./../README.md)
___
## Playwright elements fixtures

*This documentation explains how to use `playwright-elements` with `@playwright/test`.*

*This lib extends default `test` annotation with tree custom fixtures: `goto`, `initBrowserInstance` and `usePage`.
One of them `initBrowserInstance`, are auto fixture, so you do not need to call it explicitly to use.*
___
- [goto](#goto)
- [Init browser instance](#init-browser-instance)
- [Use page in fixture](#use-page-in-fixture)
- [Use page](#use-page)
### Goto

`goto` returns [function from pure playwright](https://playwright.dev/docs/api/class-page#page-goto).

Config:
```ts
import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    use: {
        baseURL: 'https://playwright.dev',
    }
};
export default config;
```
Test:
```ts
import { test } from "playwright-elements";

test(`goto playwright docs`, async ({ goto }) => {
    await goto('/docs/test-typescript'); // navigate you directly to https://playwright.dev/docs/test-typescript
})
```
or
```ts
import { test } from "playwright-elements";

test(`goto playwright docs`, async ({ goto }) => {
    await goto(); // navigates to base url
})
```
also, you are able to pass options:
```ts
import { test } from "playwright-elements";

test(`goto playwright docs`, async ({ goto }) => {
  await goto('/', { waitUntil: 'domcontentloaded' }); // navigates to base url
})

```

### Init browser instance

`initBrowserInstance` is auto fixture which returns void, and it's main purpose is to set currentPage,
currentContext and browser pointers.

### Use page in fixture
Just a representation of function [Use page](#use-page) as fixture.
`usePage` allows user to perform actions in another context. In case you need to use second tab
in the same context use `BrowserInstance.swith`

Use case:
```ts
type TestFixtures = { secondContextPage: Page, useSecondContext: <T>(callback: () => Promise<T>) => Promise<T> };

const test = baseTest.extend<TestFixtures>({
  secondContextPage: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  }, { scope: 'test' }],
  useSecondContext: [async ({ secondContextPage }, use) => {
    await use(<T>(callback: () => Promise<T>) => usePage<T>(secondContextPage, callback));
  }, {  scope: 'test' }]
});

test('example', async ({ goto, useSecondContext }) => {
  await goto();
  const text = await useSecondContext<string>(async () => {
    await goto('/docs/test-fixtures');
    return title.textContent();
  });
  expect(text).toEqual('Fixtures');
  expect(await title.textContent()).toEqual('Playwright enables reliable end-to-end testing for modern web apps.')
});
```

## Use page
The `usePage` function allows you to switch execution to a specific page context.
This is especially useful when your test requires interactions with more than one BrowserContext.
While inside the callback, all operations performed using playwright-elements will act on the provided page,
without interfering with the default context.


Example:

```ts
import { test as baseTest, $, usePage } from 'playwright-elements';
import { Page } from '@playwright/test';

type TestFixtures = {
    secondContextPage: Page
};

const test = baseTest.extend({
    secondContextPage: [
        async ({ browser }, use) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            await use(page);
            await context.close();
        },
        { scope: 'test' }
    ]
});

test.describe('Working with Multiple Contexts', () => {
  test('should operate on two different contexts', async ({ goto, secondContextPage }) => {
    // Navigate both pages concurrently.
    await Promise.all([
      goto('https://default.com'),
      secondContextPage.goto('https://url.com')
    ]);
    // Execute operations on the second context.
    const customContextPromise = usePage(secondContextPage, async () => {
      // All playwright-elements calls here occur in `secondContextPage`.
      await $('h1').softExpect().toHaveUrl('https://url.com');
    });
    // Execute operations on the default context.
    const defaultContextPromise = $('h1').softExpect().toHaveUrl('https://default.com');
    // Wait for both operations to complete.
    await Promise.all([defaultContextPromise, customContextPromise]);
  });
});
```

You can also return a value from the callback passed to `usePage`.
In the following example, we retrieve the text content of an `<h1>` element from a specified page:

```ts
    test('usePage returns value', async ({ goto, page }) => {
      await goto();
      const text = await usePage<string>(page, async () => {
        return $('h1').textContent();
      });
      expect(text).toEqual('Expected title');
    });
```
___
[Go to Main Page >>](./../README.md)
