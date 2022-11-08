## Playwright elements fixtures

*This documentation page explain how to use `playwright-elements` with `@playwright/test`.*

*This lib extends default `test` annotation with tree custom fixtures: `navigate`, `goto`, `browserInstance`.
Two of them `navigate`, `browserInstance`, are auto fixtures, so you do not need to call them explicitly to use.*
___
- [navigate](#navigate)
- [goto](#goto)
- [Browser Instance](#browser-instance)

___
### navigate

`navigate` automatically opens `baseURL` if it is specified in playwright config. 
Also it is void, so does not make sense to use it explicitly in tests.
___
### goto

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
___

## Browser Instance

`browserInstance` is second automatic fixture, but it returns object BrowserInstance which is important
for lazy initialization. More information here: [Browser Instance](/docs/browser.instance.md).
It provides access to `Browser`, `BrowserContext` and `Page` types from `playwright-core`
so you do not need to call those fixtures explicitly anymore.

```ts
import {test} from "playwright-elements";
import {Browser, BrowserContext, Page} from "playwright-core";

test(`goto playwright docs`, async ({browserInstance}) => {
    const browser: Browser = BrowserInstance.browser;
    const context: BrowserContext = BrowserInstance.currentContext;
    const page: Page = BrowserInstance.currentPage;
})
```
