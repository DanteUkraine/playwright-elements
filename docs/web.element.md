## WebElement

*WebElement class is a wrapper on playwright Locator. Tt was created to allow lazy initialization in 
page object and creation of complex web components which support more than two levels deep sub elements
with ability to add custom methods.*
___
- [Sub elements](#sub-elements)
- [Expect](#expect)
- [With methods and getters: locator and _](#with-methods-locator-and-underscore)
- [Build in selector helpers](#build-in-selector-helpers)
  - [Has](#has)
  - [With visible](#with-visible)
  - [With text and where text is](#with-text-and-where-text-is)
  - [Get element by index](#get-element-by-index)
- [Strict mode](#strict-mode)  
- [As frame](#as-frame)
- [Lists of WebElements](#lists-of-webelements)
  - [Async for each](#async-for-each)
  - [Sync for each](#sync-for-each)
  - [Map](#map)
  - [Filter](#filter)
- [How to extend WebElement](#how-to-extend-web-element)
  
___
First you need to allow lazy initialization, 
if you use `@playwright/test` see: [Playwright Test fixtures](playwright.test.fixtures.md).
In case you use any another test runner see: [Browser Instance](browser.instance.md)
___

### Sub elements

*Complex component creation:*

```ts
import { $ } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .subElements({
            userInfoSection: $(`.userInfo`)
                .subElements({
                    firstName: $(`.first-name`),
                    lastName: $(`.last-name`),
                    avatar: $(`.userImage`)
                })
        })
}
```
___
### Expect
Web element has methods `expect()` and `softExpect()` which allows access to 
[playwright assert library](https://playwright.dev/docs/test-assertions). 
Please pay attention that Locator passed to native expect method under the hood 
that's why you can access only locators based assert methods.

```ts
test(`header should contain user info`, async () => {
    const mainPage = new MainPage();
    await mainPage.header.userInfoSection.firstName.softExpect().toHaveText(`Bob`);
    await mainPage.header.userInfoSection.lastName.softExpect().toHaveText(`Automation`);
    await mainPage.header.userInfoSection.avatar.expect().toBeVisible();
})
```
---
### With methods, Locator and underscore

```ts
import { $, WebElement } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .subElements({
            humburgerButton: $(`.hButton`),
            menu: $(`.menu`)
                .subElements({
                    item: $(`.menu-item`)
                        .withMethods({
                            async hoverAndClick(this: WebElement) {
                                await this.locator.hover();
                                await this._.click();
                            }
                        })
                })
        })
}
```

Web element has getters `locator` and `_` both return instance of [Locator](https://playwright.dev/docs/api/class-locator).
Also `hoverAndClick` method now can be used on item element. Please pay attention that to access web element
default methods inside additional method declaration is used fake `this: WebElement` pointer. 
```ts
test(`user can open documentaation`, async () => {
    const mainPage = new MainPage();
    await mainPage.header.humburgerButton._.click();
    await mainPage.header.menu.item.withText(`Documentation`).hoverAndClick();
})
```
___
## Build in selector helpers

### Has
Method `has(selector: string | WebElement)` helps to find elements with specific child.

*Based on selector:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly fieldRows = $(`.field-row`).has(`input.enabled`);
}
```
*Based on WebElement:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    private readonly enabledEnputs = $(`input.enabled`);
    readonly fieldRows = $(`.field-row`).has(enabledEnputs);
}
```
___

### With visible
Method `withVisible()` adds to element selector `>> visible=true`, 
playwright docs about [selecting visible elements](https://playwright.dev/docs/selectors#selecting-visible-elements).

```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly errors = $(`.error-message`).withVisible();
}
```
___
### With text and where text is
Method `withText("text")` adds to selector `>> text=text` 
and method `whereTextIs("text")` adds to selector `>> text="text"`,
playwright docs about [text selectors](https://playwright.dev/docs/selectors#text-selector).

```ts
import {$} from "playwright-elements";

class MainPage {
  readonly errors = $(`.error-message`);
}

test(`find error by text`, async () => {
  const mainPage = new MainPage();
  await mainPage.errors.withText(`Incorect`).expect().toBeVisible();
  await mainPage.errors.whereTextIs(`Incorect password`).expect().toBeVisible();
})
```
___
### Get element by index
Method `nth(index: number)` adds to selector `>> nth=${index}`
and methods `first()` adds `>> nth=0`, `last()`  adds `>>nth=-1`
playwright docs about [nth element selector](https://playwright.dev/docs/selectors#n-th-element-selector)

___
## Strict mode
By default, Locator is in strict mode, [docs](https://playwright.dev/docs/locators#strictness).

*So in case you want to ignore it this rule you can `first()`, `last()` or `nth(index: number)` 
methods to point in particular element by index:*

```ts
import {$} from "playwright-elements";

class MainPage {
  readonly errors = $(`.error-message`);
}

test(`find error by text`, async () => {
  const mainPage = new MainPage();
  await mainPage.errors.first().expect().toHaveText("Incorrect First name");
  await mainPage.errors.last().expect().toHaveText("Incorrect paasword");
})
```
___

## As Frame
When you need to use [FrameLocator](https://playwright.dev/docs/api/class-framelocator) 
as `WebElement` method `asFraame()` let to know that selector 
should be used in `page.frameLocator('#my-frame')`.

*Behind the scene playwright-elements will build next expression:
`page.frameLocator('#my-frame').locator('.header')`*
```ts
import {$} from "playwright-elements";

class MainPage {
  readonly iframe = $(`#my-frame`).asFrame()
          .subElements({
            header: $(`.header`)
          });
}

test(`find error by text`, async () => {
  const mainPage = new MainPage();
  await mainPage.iframe.header.expec().toBeVisible();
})
```
___
## Lists of WebElements

Suite of methods to work with arrays of elements.

### Async for each
Method `asyncForEach(action: (element: T) => unknown | Promise<unknown>)): Promise<void>` 
works with sync and async functions in callbacks and returns promise, so you can await on execution.

*Inside asyncForEach all callbacks are collected in to array and wrapped in 
Promise.all([action(element), action(element)...]). This approach is suitable when you need 
to collect for example text from elements or perform soft assert. But such actions like click, hover, fill, 
actually any interactions with web elements will not work stable inside this loop. For actions is better to use
`syncForEach`.*

```ts
test(`asyncForEach example`, async () => {
    const elements = $(`li`);
    const elementsTexts: (string | null)[] = [];
    await elements.asyncForEach(async (e) => elementsTexts.push(await e.locator.textContent()));
})
```
___
### Sync for each
Method `syncForEach<T extends WebElement>(this: T, action: (element: T) => unknown | Promise<unknown>): Promise<void>`
works with sync and async functions in callbacks and returns promise, so you can await on execution.

*Inside syncForEach each action awaited `for (const ele of list) { await action(ele); }`. 
This approach is suitable when you need to perform the same action for each element one by one.*

```ts
test(`syncForEach example`, async () => {
    const elements = $(`input`);
    await elements.syncForEach(async (e) => await e.locator.type(`abc`));
})
```
___
### Map
Method `map<T extends WebElement, R>(this: T, item: (element: T) => R): Promise<R[]>`
works with sync and async functions in callbacks and returns list of extracted values.

```ts
test(`map example`, async () => {
    const elements = $(`li`);
    const texts: (string | null)[] = await elements.map(async (e) => await e.locator.textContent());
})
```
___
### Filter
Method `filter<T extends WebElement>(this: T, predicate: (element: T) => boolean | Promise<boolean>): Promise<T[]>`
works with sync and async functions in callbacks and returns sub list of elements for with predicate returned true.

```ts
test(`filter example`, async () => {
    const elements = $(`input`);
    const enabledInputs = await elements.filter(async (e) => await e.locator.isEnabled());
})
```
___
## How to extend Web Element

In case you want to create custom web element.

*Extend base class, create init function:*
```ts
import { WebElement } from "playwright-elements";

class Field extends WebElement {
	async set(this: WebElement, value: string) {
        await this.fill("");
        await this.type(value, { delay: 50 });
	}
}

export function $field(selector: string): Input {
	return new Field(selector);
}
```
*or static factory function:*
```ts
import { WebElement } from "playwright-elements";

export class Field extends WebElement {
	async set(this: WebElement, value: string) {
        await this.fill("");
        await this.type(value, { delay: 50 });
	}
    
    static $(selector: string): Input {
    return new Field(selector);
  }
}
```
*And use in your elements:*
```ts
import { $ } from "playwright-elements";
import { Input } from "./field.element";

export class MissingControlOverviewPage {

  readonly form = $(`.form`)
          .subElements({
            nameField: Input.$(`.name-field`),
          });
}
```
*or:*
```ts
import { $ } from "playwright-elements";
import { $field } from "./field.element";

export class MissingControlOverviewPage {

  readonly form = $(`.form`)
          .subElements({
            nameField: $field(`.name-field`),
          });
}
```
