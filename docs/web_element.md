---
layout: default
title: Get started
---
[Go to Main Page >>](./../README.md)

## Web element

*WebElement class is a wrapper on playwright Locator. It was created to allow creation of complex
web components which support multiple levels sub elements with ability to add custom methods with type safe "this".*

- [Get by methods](#get-by-methods)
- [With](#with)
- [Expect](#expect)
- [Extended Expect](#extended-expect)
- [Locator and underscore](#locator-and-underscore)
- [Get parent](#get-parent)
- [Build in selector helpers](#build-in-selector-helpers)
- [And](#and)
- [Has](#has)
- [Has not](#has-not)
- [Has text](#has-text)
- [Has not text](#has-not-text)
- [Get element by index](#get-element-by-index)
- [Strict mode](#strict-mode)
- [Content Frame and Owner](#content-frame-and-owner)
- [Clone](#clone)
- [Lists of WebElements](#lists-of-webelements)
    - [Async for each](#async-for-each)
    - [Sync for each](#sync-for-each)
    - [Map](#map)
    - [Filter elements](#filter-elements)
    - [Filter](#filter)
- [Add handler](#add-handler)
- [Remove handler](#remove-handler)
- [Get Text](#get-text)
- [Actions (Ported Locator methods)](#actions)
    - [All inner texts](#all-inner-texts)
    - [All text contents](#all-text-contents)
    - [Aria snapshot](#aria-snapshot)
    - [Blur](#blur)
    - [Bounding box](#bounding-box)
    - [Check](#check)
    - [Clear](#clear)
    - [Click](#click)
    - [Count](#count)
    - [Double click](#double-click)
    - [Dispatch event](#dispatch-event)
    - [Drag to](#drag-to)
    - [Fill](#fill)
    - [Focus](#focus)
    - [Get attribute](#get-attribute)
    - [Highlight](#highlight)
    - [Hover](#hover)
    - [Inner HTML](#inner-html)
    - [Inner text](#inner-text)
    - [Input value](#input-value)
    - [Is checked](#is-checked)
    - [Is disabled](#is-disabled)
    - [Is editable](#is-editable)
    - [Is enabled](#is-enabled)
    - [Is hidden](#is-hidden)
    - [Is visible](#is-visible)
    - [Press](#press)
    - [Screenshot](#screenshot)
    - [Scroll into view if needed](#scroll-into-view-if-needed)
    - [Select option](#select-option)
    - [Select text](#select-text)
    - [Set checked](#set-checked)
    - [Set input files](#set-input-files)
    - [Tap](#tap)
    - [Text content](#text-content)
    - [Press sequentially](#press-sequentially)
    - [Uncheck](#uncheck)
    - [Wait for](#wait-for)
- [How to extend WebElement](#how-to-extend-web-element)

### Get by methods

Next methods allow easy way to create locators in complex components.

- [$getByAltText](https://playwright.dev/docs/api/class-page#page-get-by-alt-text)
- [$getByLabel](https://playwright.dev/docs/api/class-page#page-get-by-label)
- [$getByPlaceholder](https://playwright.dev/docs/api/class-page#page-get-by-placeholder)
- [$getByRole](https://playwright.dev/docs/api/class-page#page-get-by-role)
- [$getByTestId](https://playwright.dev/docs/api/class-page#page-get-by-test-id)
- [$getByText](https://playwright.dev/docs/api/class-page#page-get-by-text)
- [$getByTitle](https://playwright.dev/docs/api/class-page#page-get-by-title)

Example:
```ts
import { $getByTestId, $getByPlaceholder, $getByTitle } from "playwright-elements"; 

class MainPage {
    readonly form = $getByTestId(`login-form`)
        .with({
            loginField: $getByPlaceholder('Email or phonenumber'),
            passwordField: $getByPlaceholder('Password'),
            submitButton: $getByTitle('Login')
        })
}
```

### With
This builder like method allows you to create multiple sub elements and add custom methods in one json like body.

*Complex component creation:*
```ts
import { $ } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .with({
            userInfoSection: $(`.userInfo`)
                .with({
                    firstName: $(`.first-name`),
                    lastName: $(`.last-name`),
                    avatar: $(`.userImage`)
                })
        })
}
```
*Additional methods support with type safe pointer "this"*
```ts
import { $ } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .with({
            humburgerButton: $(`.hButton`),
            menu: $(`.menu`)
                .with({
                    item: $(`.menu-item`),
                    async expand() {
                      await this.locator.hover();
                      await this.click();
                    }
                }),
            async someCustomHeaderMethod() {
              //...
            }
        })
}
```

Allows selector chaining:
```ts
import { $ } from "playwright-elements"; 

class MainPage {
    readonly element = $getByTestId('parentTestId').$('.child')
            .with({
              subChild: $getByTestId('subChildId').$('.subChild2'),
            });
}
```

### Expect
Web element has methods `expect()` and `softExpect()` which allows access to
[playwright assert library](https://playwright.dev/docs/test-assertions).
Please pay attention that Locator passed to native expect method under the hood
that's why autocomplete works only for default locator matchers but pay attention that it allows you to call
custom matchers without errors.

```ts
test(`header should contain user info`, async () => {
    const mainPage = new MainPage();
    await mainPage.header.userInfoSection.firstName.softExpect().toHaveText(`Bob`);
    await mainPage.header.userInfoSection.lastName.softExpect().toHaveText(`Automation`);
    await mainPage.header.userInfoSection.avatar.expect().toBeVisible();
})
```

### Extended Expect
Web element allows users to use custom matchers (even if you do not reassign extended expect explicitly),
they can be called without any errors but autocomplete features may not work.
Related playwright docs: https://playwright.dev/docs/next/test-assertions#add-custom-matchers-using-expectextend

```ts
import { Locator } from '@playwright/test';
import { expect, $, test } from 'playwright-elements';

expect.extend({
    async toHaveAriaLabel(locator: Locator, expected: string, options?: { timeout?: number }) {
       ...
    }
});

test.describe(() => {
    test(`use custom expect matcher example`, async ({ goto }) => {
        await goto('/');
        const header = $(`.navbar`);
        await header.expect().toHaveAriaLabel('Main');
    })
})
```

In case you have plenty of custom expect matchers, and you want to make autocomplete work you need to extend
web element and add additional expect method:

customWebElement.ts
```ts
import { WebElement, expect } from 'playwright-elements';

const extendedExpect = expect.extend(customMatchers);
class CustomWebElement extends WebElement {
  public customExpect(message?: string) {
    return extendedExpect(this.locator, message);
  }
}

export function $(selector: string): CustomWebElement {
  return new CustomWebElement(selector);
}
```

someTest.test.ts
```ts
import { test } from 'playwright-elements';
import { $ } from './customWebElement';

test(`custom expect matcher`, async ({ goto }) => {
  await goto('/');
  const header = $(`.navbar`);
  await header.customExpect().toHaveAriaLabel('Main');
})
```
Now autocomplete works but in case you want explicitly define return type for customExpect method
you can use utility type (ReturnType), this will guarantee correct autocomplete:
```ts
import { Locator } from '@playwright/test';
import { WebElement, expect } from 'playwright-elements';

const extendedExpect = expect.extend(customMatchers);
class CustomWebElement extends WebElement {
  public customExpect(message?: string): ReturnType<typeof extendedExpect<Locator>> {
    return extendedExpect(this.locator, message);
  }
}
```


### Locator and underscore

Web element has getters `locator` and `_` both return instance of [Locator](https://playwright.dev/docs/api/class-locator).

```ts
import { test } from 'playwright-elements';
import { MainPage } from 'main.page';

test.describe('Playwright test integration', () => {

    test('expect positive', async () => {
        const mainPage = new MainPage();
        // Both lines do the same.
        await mainPage.header.logo.locator.click(); 
        await mainPage.header.logo._.click();
    })
})
```

### Get parent
`parent<T>(this: WebElement): WebElement & T` method allows get parent and extend it's type.

Allows to access parent element.

```ts
import { $, WebElement } from "playwright-elements";

const header = $('.header')
    .with({
         logo: $('.log-img'),
         logIn : $('#log-in')
    });
header.logo.parent(); // allows to access parent web element
header.login.parent<{ logo: WebElement }>(); // also parent method accepts generic with type
```
It allows users to access sibling elements inside custom methods.
```ts
import { $, WebElement } from "playwright-elements";

const header = $('.header')
    .with({
         userIcon: $('#icon'), 
         logIn : $('#log-in')
             .with({
                  async goToLoginPage(this: WebElement) {
                      await this.parent<userIcon>().userIcon.hover();
                      await this.click();
                  } 
             })
    });
```
Despite strict return type `parent<T>(this: WebElement): WebElement & T`
when element has not parent it returns `undefined`.
It allows avoid optional chaining each time you need call anything from parent
but still implement if condition.
```ts
import { $, WebElement } from "playwright-elements";

test(`get parent`, () => {
  const header = $('.header');
  header.parent; // undefined
})
```

## Build in selector helpers

### And

The `and(this: R, element: string | T): R` method allows you to combine multiple selectors to refine the search for a single element.

```ts
import { $ } from "playwright-elements";

const button = $('button').and('[title=Subscribe]');
```
or
```ts
import { $getByRole, $getByTitle } from "playwright-elements";

const button = $getByRole('button').and($getByTitle('Subscribe'));
```

## Or

The `or(this: R, element: string | T): R` method enables you to specify alternative selectors for locating an element.

```ts
import { test, $ } from "playwright-elements";

const button = $('button').or($('input[type=button]'));

test('or', async () => {
  await button.expect().toBeVisible();
})
```

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

### Has not
Method `hasNot(selector: string | WebElement)` helps to find elements without specific child.

*Based on selector:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly fieldRows = $(`.field-row`).hasNot(`input.disabled`);
}
```
*Based on WebElement:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    private readonly enabledEnputs = $(`input.disabled`);
    readonly fieldRows = $(`.field-row`).hasNot(enabledEnputs);
}
```

### Has text
Method `hasText(text: string | RegExp)` helps to find elements with specific text or child with text.
*Based on text:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly paragraph = $(`p`).hasText(`Some text:`);
}
```
*Based on RegExp:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly paragraph = $(`.p`).hasText(/Some text:/);
}
```

### Has not text
Method `hasNotText(text: string | RegExp)` helps to find elements without specific text or child with text.
*Based on text:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly paragraph = $(`p`).hasNotText(`Some text`);
}
```
*Based on RegExp:*
```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly paragraph = $(`.p`).hasNotText(/Some text/);
}
```
*Methods **has**, **hasNot**, **hasText** and **HasNotText** can be combined in chain.*

```ts
import { $ } from "playwright-elements";

class MainPage {
    readonly fieldRows = $(`.field-row`).hasText(`Title:`).has(`input.enabled`);
}
```
### Get element by index
Method `nth(index: number)` will call from current locator in runtime `locator(...).nth(index)`
and methods `first()` calls `locator(...).nth(0)`, `last()` calls `locator(...).nth(-1)`
playwright docs about [nth()](https://playwright.dev/docs/api/class-locator#locator-nth)

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

## Content Frame and Owner
When you need to use [FrameLocator](https://playwright.dev/docs/api/class-locator#locator-content-frame)
as `WebElement` method `contentFrame()` will use frame locator `page.frameLocator('#my-frame')`.
And in case you need to switch back use method `owner()`.

*Behind the scene playwright-elements will build next expression:
`page.frameLocator('#my-frame').locator('.header')`*
```ts
import {$} from "playwright-elements";

class MainPage {
  readonly iframe = $(`#my-frame`).contentFrame()
          .with({
            header: $(`.header`)
          });
}

test(`find error by text`, async () => {
  const mainPage = new MainPage();
  await mainPage.iframe.header.expec().toBeVisible();
  await mainPage.iframe.owner(); // will use locator instead of frame locator.
})
```

### Clone
`clone<T extends WebElement>(this: T, options?: {
selector?: string
hasLocator?: string,
hasNotLocator?: string,
hasText?: string | RegExp,
hasNotText?: string | RegExp,
nth?: number
}): T` method allows to clone any web element and override it's selector and filter properties.

```ts
import { $ } from 'playwright-elements';

const originElement = $('.button').hasText('Submit').hasNotText('Ok');
const owerridenElement = originElement.clone({ selector: 'input[type=button]' }); // will still hasText=Submit and haasNotTet=Ok but will use another selector.
```

### Add handler
`addHandler<T extends WebElement>(this: T, handler: (element: T) => Promise<any>, options?: { noWaitAfter?: boolean, times?: number }): Promise<void>` method is simple port of [addLocatorHandler function](https://playwright.dev/docs/api/class-page#page-add-locator-handler).

### Remove handler
`removeHandler(): Promise<void>` method is simple port of [removeLocatorHandler function](https://playwright.dev/docs/api/class-page#page-remove-locator-handler).

### Get Text

`getText` method is a wrapper on textContent with checks if returned value is not null and returns `string`.
In case `textContent` returns null `getText` will throw error: `'Text content method returned null for selector: "img"'`.

## Actions
Web elements provide users with direct access to common actions from playwright [locator class](https://playwright.dev/docs/api/class-locator).
But in case you will need to use such methods as `evaluate`, `evaluateAll`, `locator.filtrer`, `locator.all` or any
another method from locator which you will not be abel find in list below please use getter [locator] or [_]

#### All inner texts
`$('selector').allInnerTexts();` calls: [allInnerTexts()](https://playwright.dev/docs/api/class-locator#locator-all-inner-texts).

#### All text contents
`$('selector').allTextContents();` calls: [allTextContents()](https://playwright.dev/docs/api/class-locator#locator-all-text-contents).

#### Aria snapshot
`$('selector').ariaSnapshot(options?);` calls [ariaSnapshot(options?)](https://playwright.dev/docs/api/class-locator#locator-aria-snapshot).

#### Blur
`$('selector').blur(options?);` calls: [blur()](https://playwright.dev/docs/api/class-locator#locator-blur).

#### Bounding box
`$('selector').boundingBox(options?);` calls: [boundingBox()](https://playwright.dev/docs/api/class-locator#locator-bounding-box).

#### Check
`$('selector').check(options?);` calls: [check()](https://playwright.dev/docs/api/class-locator#locator-check).

#### Clear
`$('selector').clear(options?);` calls: [clear()](https://playwright.dev/docs/api/class-locator#locator-clear).

#### Click
`$('selector').click(options?);` calls: [click()](https://playwright.dev/docs/api/class-locator#locator-click).

#### Count
`$('selector').count();` calls: [count()](https://playwright.dev/docs/api/class-locator#locator-count).

#### Double click
`$('selector').dblclick(options?);` calls: [dblclick()](https://playwright.dev/docs/api/class-locator#locator-dblclick).

#### Dispatch event
`$('selector').dispatchEvent(type, eventInit?, options?);` calls: [dispatchEvent()](https://playwright.dev/docs/api/class-locator#locator-dispatch-event).

#### Drag to
`$('selector').dragTo(target, options?);` calls: [dragTo()](https://playwright.dev/docs/api/class-locator#locator-drag-to).

#### Fill
`$('selector').fill(value, options?);` calls: [fill()](https://playwright.dev/docs/api/class-locator#locator-fill).

#### Focus
`$('selector').focus(options?);` calls: [focus()](https://playwright.dev/docs/api/class-locator#locator-focus).

#### Get attribute
`$('selector').getAttribute(name, options?);` calls: [getAttribute()](https://playwright.dev/docs/api/class-locator#locator-get-attribute).

#### Highlight
`$('selector').highlight();` calls: [highlight()](https://playwright.dev/docs/api/class-locator#locator-highlight).

#### Hover
`$('selector').hover(options?);` calls: [hover()](https://playwright.dev/docs/api/class-locator#locator-hover).

#### Inner HTML
`$('selector').innerHTML(options?);` calls: [innerHTML()](https://playwright.dev/docs/api/class-locator#locator-inner-html).

#### Inner text
`$('selector').innerText(options?);` calls: [innerText()](https://playwright.dev/docs/api/class-locator#locator-inner-text).

#### Input value
`$('selector').inputValue(options?);` calls: [inputValue()](https://playwright.dev/docs/api/class-locator#locator-input-value).

#### Is checked
`$('selector').isChecked(options?);` calls: [isChecked()](https://playwright.dev/docs/api/class-locator#locator-is-checked).

#### Is disabled
`$('selector').isDisabled(options?);` calls: [isDisabled()](https://playwright.dev/docs/api/class-locator#locator-is-disabled).

#### Is editable
`$('selector').isEditable(options?);` calls: [isEditable()](https://playwright.dev/docs/api/class-locator#locator-is-editable).

#### Is enabled
`$('selector').isEnabled(options?);` calls: [isEnabled()](https://playwright.dev/docs/api/class-locator#locator-is-enabled).

#### Is hidden
`$('selector').isHidden();` calls: [isHidden()](https://playwright.dev/docs/api/class-locator#locator-is-hidden).

#### Is visible
`$('selector').isVisible(options?);` calls: [isVisible()](https://playwright.dev/docs/api/class-locator#locator-is-visible).

#### Press
`$('selector').press(key, options?);` calls: [press()](https://playwright.dev/docs/api/class-locator#locator-press).

#### Screenshot
`$('selector').screenshot(options?);` calls: [screenshot()](https://playwright.dev/docs/api/class-locator#locator-screenshot).

#### Scroll into view if needed
`$('selector').scrollIntoViewIfNeeded(options?);` calls: [scrollIntoViewIfNeeded()](https://playwright.dev/docs/api/class-locator#locator-scroll-into-view-if-needed).

#### Select option
`$('selector').selectOption(values, options?);` calls: [selectOption()](https://playwright.dev/docs/api/class-locator#locator-select-option).

#### Select text
`$('selector').selectText(options?);` calls: [selectText()](https://playwright.dev/docs/api/class-locator#locator-select-text).

#### Set checked
`$('selector').setChecked(checked, options?);` calls: [setChecked()](https://playwright.dev/docs/api/class-locator#locator-set-checked).

#### Set input files
`$('selector').setInputFiles(files, options?);` calls: [setInputFiles()](https://playwright.dev/docs/api/class-locator#locator-set-input-files).

#### Tap
`$('selector').tap(options?);` calls: [tap()](https://playwright.dev/docs/api/class-locator#locator-tap).

#### Text content
`$('selector').textContent(options?);` calls: [textContent()](https://playwright.dev/docs/api/class-locator#locator-text-content).

#### Press sequentially
`$('selector').pressSequentially(text, options?);` calls: [pressSequentially()](https://playwright.dev/docs/api/class-locator#locator-press-sequentially).

#### Uncheck
`$('selector').uncheck(options?);` calls: [uncheck()](https://playwright.dev/docs/api/class-locator#locator-uncheck).

#### Wait for
`$('selector').waitFor(options?);` calls: [waitFor()](https://playwright.dev/docs/api/class-locator#locator-wait-for).

## Lists of WebElements

Suite of methods to work with arrays of elements.

### Get all
Method `getAll<T extends WebElement>(this: T): Promise<T[]>` returns list of Web elements without any waiting
based on count of elements in particular moment of time.

```ts
import { $, WebElement } from 'playwright-elements';

test(`list of web elements`, async () => {
  const elements: WebElement[] = $(`li`).getAll();
})
```

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
### Map
Method `map<T extends WebElement, R>(this: T, item: (element: T) => R | Promise<R>): Promise<Awaited<R[]>>`
works with sync and async functions in callbacks and returns list of extracted values.

```ts
test(`map example`, async () => {
    const elements = $(`li`);
    const texts: (string | null)[] = await elements.map(async (e) => await e.locator.textContent());
})
```
### Filter elements
Method `filterElements<T extends WebElement>(this: T, predicate: (element: T) => boolean | Promise<boolean>): Promise<T[]>`
works with sync and async functions in callbacks and returns sub list of elements for with predicate returned true.

```ts
test(`filter elements example`, async () => {
    const elements = $(`input`);
    const enabledInputs = await elements.filterElements(async (e) => await e.locator.isEnabled());
})
```

In case you filter elements inside added method via `with` method `typeof this` will help to keep type safety:
```ts
$('.row').with({
  async filterTableRows(text: string) {
    await this.last().waitFor();

    return this.filterElements(async (i: typeof this) => {
              const attr = await i.status.getAttribute('aria-label');
              return attr ? attr.includes(text) : false;
        });
  }
});
```

### Filter
Method `filter<T extends WebElement, R extends WebElement>(this: T, options: { has?: string | T, hasNot?: string | T: hasText?: string, hasNotText?: string }): R`
This method narrows existing locator according to the options, for example filters by text.

```ts
test(`filter elements example`, async () => {
  const elements = $(`div`);
  const filtered = elements.filter({ has: '#id', hasNot: '.hidden', hasText: 'Visible target', hasNotText: 'Visible wrong target' });
})
```

## How to extend Web Element

In case you want to create custom web element.

*Extend base class, create init function:*
```ts
import { WebElement } from 'playwright-elements';

class Field extends WebElement {
    
	public async set(value: string) {
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

export class Input extends WebElement {
    
	public async set(value: string) {
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
          .with({
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
          .with({
            nameField: $field(`.name-field`),
          });
}
```

[Go to Main Page >>](./../README.md)