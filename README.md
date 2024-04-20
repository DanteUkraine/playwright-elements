# Playwright-elements
[![Awesome](https://awesome.re/mentioned-badge.svg)](https://github.com/mxschmitt/awesome-playwright/blob/master/README.md#utils)

___
*Playwright elements helps you to create reusable components with ability to add child elements, methods
and call them in chain. Reduce amount of your code in page object, or even use elements without page object.*

*Playwright-elements facilitates the representation of a web component's tree structure, 
where each component can have multiple descendants, and all elements within the tree inherit the Locator API.
Each element enables the invocation of both descendant elements and methods from the Locator API, 
allowing to construct an invocation-chain of calls involving elements and synchronous methods.*

***Installation:*** `npm install -D playwright-elements`

***IMPORTANT:*** playwright elements is not standalone framework, it requires:
-  v1.5: `@playwright/test >= 1.27.x` to added to project.
-  v1.6: `@playwright/test >= 1.33.x` to added to project.
-  v1.8: `@playwright/test >= 1.34.x` to added to project.
-  v1.9: `@playwright/test >= 1.38.x` to added to project.
-  v1.10: `@playwright/test >= 1.40.x` to added to project.
-  v1.13: `@playwright/test >= 1.42.x` to added to project.

___
- [Get started](#get-started)
- [Web element](#web-element)
  - [Get by methods](#get-by-methods)
  - [Sub elements](#sub-elements)
  - [Direct child](#direct-child)
  - [Expect](#expect)
  - [Extended Expect](#extended-expect)
  - [Locator and underscore](#locator-and-underscore)
  - [With methods](#with-methods)
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
  - [Actions](#actions) 
    - [All inner texts](#all-inner-texts)
    - [All text contents](#all-text-contents)
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
- [Playwright elements fixtures](#playwright-elements-fixtures)
  - [goto](#goto)
  - [Init browser instance](#init-browser-instance)
  - [use page](#fixture-use-page)
- [Browser instance](#browser-instance)
  - [Browser name](#browser-name)
  - [Start](#start)
  - [Start new context](#start-new-context)
  - [Start new page](#start-new-page)
  - [Close browser](#close)
  - [Getters and setters](#getters-and-setters)
  - [Builder like methods](#builder-like-methods)
  - [Switch to previous tab](#switch-to-previous-tab)
  - [Switch tab by index](#switch-tab-by-index)
- [Use page](#use-page)   

___
## Get started

No need to pass instance of page into your page object.
```ts
import { $ } from 'playwright-elements';

class MainPage {
    readonly header = $('.navbar');
}
```

Each element which was created by **$** function returns instance of WebElement so code may look next:
```ts
import { $, WebElement } from 'playwright-elements';

class MainPage {
    readonly header: WebElement = $('.navbar');
}
```

**$** function is just a shortcut for **new WebElement('.navbar');**

Each WebElement can have sub elements and child elements can have sub elements as well.
**subElements({logo: $('.navbar__title')})** or **with({logo: $('.navbar__title')})** returns type intersection.
```ts
import { $, WebElement } from 'playwright-elements';

type Header = WebElement & { logo: WebElement }

class MainPage {
    readonly header: Header = $('.navbar')
        .with({
            logo: $('.navbar__title'),
            githubLogo: $('a[aria-label="GitHub repository"]')
        });
}
```

Several elements deep structure:

```ts
import { $, WebElement } from 'playwright-elements';

type Table = WebElement & { thead: Webelement }

class MainPage {
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

```ts
import { $, WebElement } from 'playwright-elements';

type Table = WebElement & { thead: Webelement }

class MainPage {
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

Such elements as table can be called in chain with different filters to narrow target inner 
elements for asserts or actions. 
Usage in test:
```ts
import { test } from 'playwright-elements'
import { MainPage } from 'page.object';

test.describe('Invocation chain example', () => {
    
    const mainPage = new MainPage(); // Pay attention that now your page can be initialized out of test of hooks.
    test('test', async () => {
        await mainPage.table.columnHeaders.expect().toHaveText(['ID', 'Name', 'Status']);
        await mainPage.table.rows.hasText('Justin').cells.expect().toHaveText(['123', 'Justin', 'Single']);
    });
    
});
```

___
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

```ts
import { test } from 'playwright-elements';
import { MainPage } from 'page.object'

test.describe('Goto fixure example', () => {

  test('expect positive', async ({ goto }) => {
    await goto();
    const mainPage = new MainPage();
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

___
## Web element

*WebElement class is a wrapper on playwright Locator. It was created to allow creation of complex 
web components which support multiple levels sub elements with ability to add custom methods.*

___
If you use `@playwright/test` see: [Playwright elements fixtures](#playwright-elements-fixtures).
In case you use any another test runner see: [Browser Instance](#browser-instance).
___
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
import { $getByTestId, $getByPlaceholder, $getByTitle, WebElement } from "playwright-elements"; 

class MainPage {
    readonly form = $getByTestId(`login-form`)
        .subElements({
            loginField: $getByPlaceholder('Email or phonenumber'),
            passwordField: $getByPlaceholder('Password'),
            submitButton: $getByTitle('Login')
        })
}
```

### Sub elements

*Simple child element creation* 

```ts
import { $, $getByTestId } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`);
    readonly avatar = header.$getByTestId('user-img')
}
```

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

Allows chain selectors:
```ts
import { $ } from "playwright-elements"; 

class MainPage {
    readonly element = $getByTestId('parentTestId').$('.child')
            .subElements({
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

### With methods
Allows to add custom methods to web elements.
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
`hoverAndClick` method now can be used on item element. Please pay attention that to access web element
default methods inside additional method declaration is used fake `this: WebElement` pointer.
```ts
test(`user can open documentation`, async () => {
    const mainPage = new MainPage();
    await mainPage.header.menu.item.withText(`Documentation`).hoverAndClick();
})
```

### With
This method combines `subElements` and `withMethods` in one method, 
it allows you to create sub elements and add custom methods in one body.

```ts
import { $, WebElement } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .with({
            humburgerButton: $(`.hButton`),
            menu: $(`.menu`)
                .with({
                    item: $(`.menu-item`),
                    async expand(this: WebElement) {
                      await this.locator.hover();
                      await this._.click();
                    }
                }),
            async someCustomHeaderMethod(this: WebElement) {
              //...
            }
        })
}
```

### Get parent
`parent<T>(this: WebElement): WebElement & T` method allows get parent and extend it's type.

Allows to access parent element.

```ts
import { $, WebElement } from "playwright-elements";

const header = $('.header')
    .subElements({
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
    .subElements({
         userIcon: $('#icon'), 
         logIn : $('#log-in')
             .withMethods({
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
Method `and<T extends WebElement, R extends WebElement>(this: R, element: string | T): R` helps to use multiple
selectors to find one element.

```ts
import { $ } from "playwright-elements";

const button = $('button').and('[title=Subscribe]');
```
or
```ts
import { $getByRole, $getByTitle } from "playwright-elements";

const button = $getByRole('button').and($getByTitle('Subscribe'));
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
          .subElements({
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
`addHandler(handler: () => any): Promise<void>` method is simple port of [addLocatorHandler function](https://playwright.dev/docs/api/class-page#page-add-locator-handler).

```ts
public addHandler(handler: () => any): Promise<void> {
  return BrowserInstance.currentPage.addLocatorHandler(this.locator, handler);
}
```

___
## Actions
Web elements provide users with direct access to common actions from playwright [locator class](https://playwright.dev/docs/api/class-locator).
But in case you will need to use such methods as `evaluate`, `evaluateAll`, `locator.filtrer`, `locator.all` or any 
another method from locator which you will not be abel find in list below please use getter [locator] or [_]

### All inner texts
`$('selector').allInnerTexts();` calls: [allInnerTexts()](https://playwright.dev/docs/api/class-locator#locator-all-inner-texts).

### All text contents 
`$('selector').allTextContents();` calls: [allTextContents()](https://playwright.dev/docs/api/class-locator#locator-all-text-contents).

### Blur
`$('selector').blur(options?);` calls: [blur()](https://playwright.dev/docs/api/class-locator#locator-blur).

### Bounding box
`$('selector').boundingBox(options?);` calls: [boundingBox()](https://playwright.dev/docs/api/class-locator#locator-bounding-box).

### Check
`$('selector').check(options?);` calls: [check()](https://playwright.dev/docs/api/class-locator#locator-check).

### Clear
`$('selector').clear(options?);` calls: [clear()](https://playwright.dev/docs/api/class-locator#locator-clear).

### Click
`$('selector').click(options?);` calls: [click()](https://playwright.dev/docs/api/class-locator#locator-click).

### Count
`$('selector').count();` calls: [count()](https://playwright.dev/docs/api/class-locator#locator-count).

### Double click
`$('selector').dblclick(options?);` calls: [dblclick()](https://playwright.dev/docs/api/class-locator#locator-dblclick).

### Dispatch event
`$('selector').dispatchEvent(type, eventInit?, options?);` calls: [dispatchEvent()](https://playwright.dev/docs/api/class-locator#locator-dispatch-event).

### Drag to
`$('selector').dragTo(target, options?);` calls: [dragTo()](https://playwright.dev/docs/api/class-locator#locator-drag-to).

### Fill
`$('selector').fill(value, options?);` calls: [fill()](https://playwright.dev/docs/api/class-locator#locator-fill).

### Focus
`$('selector').focus(options?);` calls: [focus()](https://playwright.dev/docs/api/class-locator#locator-focus).

### Get attribute
`$('selector').getAttribute(name, options?);` calls: [getAttribute()](https://playwright.dev/docs/api/class-locator#locator-get-attribute).

### Highlight
`$('selector').highlight();` calls: [highlight()](https://playwright.dev/docs/api/class-locator#locator-highlight).

### Hover
`$('selector').hover(options?);` calls: [hover()](https://playwright.dev/docs/api/class-locator#locator-hover).

### Inner HTML
`$('selector').innerHTML(options?);` calls: [innerHTML()](https://playwright.dev/docs/api/class-locator#locator-inner-html).

### Inner text
`$('selector').innerText(options?);` calls: [innerText()](https://playwright.dev/docs/api/class-locator#locator-inner-text).

### Input value
`$('selector').inputValue(options?);` calls: [inputValue()](https://playwright.dev/docs/api/class-locator#locator-input-value).

### Is checked
`$('selector').isChecked(options?);` calls: [isChecked()](https://playwright.dev/docs/api/class-locator#locator-is-checked).

### Is disabled
`$('selector').isDisabled(options?);` calls: [isDisabled()](https://playwright.dev/docs/api/class-locator#locator-is-disabled).

### Is editable
`$('selector').isEditable(options?);` calls: [isEditable()](https://playwright.dev/docs/api/class-locator#locator-is-editable).

### Is enabled
`$('selector').isEnabled(options?);` calls: [isEnabled()](https://playwright.dev/docs/api/class-locator#locator-is-enabled).

### Is hidden
`$('selector').isHidden();` calls: [isHidden()](https://playwright.dev/docs/api/class-locator#locator-is-hidden).

### Is visible
`$('selector').isVisible(options?);` calls: [isVisible()](https://playwright.dev/docs/api/class-locator#locator-is-visible).

### Press
`$('selector').press(key, options?);` calls: [press()](https://playwright.dev/docs/api/class-locator#locator-press).

### Screenshot
`$('selector').screenshot(options?);` calls: [screenshot()](https://playwright.dev/docs/api/class-locator#locator-screenshot).

### Scroll into view if needed
`$('selector').scrollIntoViewIfNeeded(options?);` calls: [scrollIntoViewIfNeeded()](https://playwright.dev/docs/api/class-locator#locator-scroll-into-view-if-needed).

### Select option
`$('selector').selectOption(values, options?);` calls: [selectOption()](https://playwright.dev/docs/api/class-locator#locator-select-option).

### Select text
`$('selector').selectText(options?);` calls: [selectText()](https://playwright.dev/docs/api/class-locator#locator-select-text).

### Set checked
`$('selector').setChecked(checked, options?);` calls: [setChecked()](https://playwright.dev/docs/api/class-locator#locator-set-checked).

### Set input files
`$('selector').setInputFiles(files, options?);` calls: [setInputFiles()](https://playwright.dev/docs/api/class-locator#locator-set-input-files).

### Tap
`$('selector').tap(options?);` calls: [tap()](https://playwright.dev/docs/api/class-locator#locator-tap).

### Text content
`$('selector').textContent(options?);` calls: [textContent()](https://playwright.dev/docs/api/class-locator#locator-text-content).

### Press sequentially
`$('selector').pressSequentially(text, options?);` calls: [pressSequentially()](https://playwright.dev/docs/api/class-locator#locator-press-sequentially).

### Uncheck
`$('selector').uncheck(options?);` calls: [uncheck()](https://playwright.dev/docs/api/class-locator#locator-uncheck).

### Wait for
`$('selector').waitFor(options?);` calls: [waitFor()](https://playwright.dev/docs/api/class-locator#locator-wait-for).
___

___
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
    
	public async set(this: WebElement, value: string) {
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
    
	public async set(this: WebElement, value: string) {
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
___

## Use page
`usePage<T>(page: Page, callBack: () => Promise<T>): Promise<T>` this function allows to execute actions in specific context.
The most common use case for this function when user needs more than one BrowserContext in test.

Example:
```ts
import { test as baseTest, $, usePage } from 'playwright-elements';

type TestFixtures = { secondContextPage: Page };
const test = baseTest.extend<TestFixtures, {}>({
  secondContextPage: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  }, { scope: 'test' }]
});

test.describe('Two contexts', () => {
  const testFixturesPage = new TestFixturesPage();

  test('use two contexts', async ({ goto, secondContextPage }) => {
    await Promise.all([goto('https://default.com'), secondContextPage.goto('https://url.com')]);
    const customContextPromise = usePage(secondContextPage, async () => {
      // All playwright-elements in this scope will use secondContextPage.
      $('h1').softExpect().toHaveUrl('https://url.com');
    });
    // All playwright-elements in main scope will use default context started by playwright test.
    const defaultContextPromise = $('h1').softExpect().toHaveUrl('https://default.com');
    await Promise.all([defaultContextPromise, customContextPromise]);
  });
});
```

Use page function can return value from callback:

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
## Playwright elements fixtures

*This documentation explains how to use `playwright-elements` with `@playwright/test`.*

*This lib extends default `test` annotation with tree custom fixtures: `goto`, `initBrowserInstance` and `usePage`.
One of them `initBrowserInstance`, are auto fixture, so you do not need to call it explicitly to use.*
___

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

### Fixture use page
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

___
## Browser Instance
*This object represents single-tone for `Browser`, `BrowserContext` and `Page`.
It allows avoiding pass `page` in your page object.*
___

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

___
*[Release notes.](https://github.com/DanteUkraine/playwright-elements/releases)*
