---
layout: default
title: Web Element
---
[Go to Main Page >>](./../README.md)

# WebElement: The Core of playwright-elements

> **WebElement is a powerful wrapper around Playwright's Locator that enables type-safe, reusable, and maintainable test components.**

The `WebElement` class is the foundation of playwright-elements. It extends Playwright's `Locator` with features that make it ideal for building complex, type-safe page objects and components.

---

## Quick Overview

### What You Can Do with WebElement

| Feature | Benefit | Example |
|---------|---------|---------|
| **Type-safe selectors** | Prevent typos, get autocompletion | `$('button.submit')` |
| **Nested components** | Build hierarchical structures | `.with({ logo: $('.logo') })` |
| **Custom methods** | Add reusable actions | `async login() { ... }` |
| **Chainable API** | Readable, expressive code | `form.username.fill('admin')` |
| **Assertions** | Full Playwright expect support | `.expect().toBeVisible()` |
| **Filtering** | Precise element targeting | `.hasText('Submit').has('.icon')` |

---

## Getting Started

### Creating a WebElement

```typescript
import { $, WebElement } from 'playwright-elements';

// Using the $ shortcut (recommended)
const button = $('button.submit');

// Direct instantiation
const input = new WebElement('input[name="username"]');

// With explicit type
const header: WebElement = $('.header');
```

### Basic Usage

```typescript
// All standard Playwright Locator methods are available
await button.click();
await input.fill('text');
const isVisible = await button.isVisible();

// Access the underlying Playwright Locator
await button.locator.hover();
await button._.click();
```

---

## Core Features

### 1. Building Nested Components with `with()`

The `.with()` method is the most powerful feature of WebElement. It allows you to create complex, type-safe component hierarchies.

#### Basic Structure

```typescript
import { $ } from 'playwright-elements';

const form = $('.login-form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
});

// Usage
await form.username.fill('admin');
await form.password.fill('password123');
await form.submit.click();
```

#### Multi-Level Nesting

```typescript
const app = $('.app').with({
  header: $('.header').with({
    logo: $('.logo'),
    navigation: $('.nav').with({
      items: $('.nav-item')
    })
  }),
  main: $('.main-content'),
  footer: $('.footer')
});

// Chain through the hierarchy
await app.header.navigation.items.first().click();
```

#### Adding Custom Methods

```typescript
const form = $('.login-form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
  
  // Add custom method with type-safe this
  async login(this: WebElement, username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
});

// Usage
await form.login('admin', 'password123');
```

**Key Benefits:**
- Full TypeScript type inference
- Autocompletion for all nested elements and methods
- Type-safe `this` in custom methods
- Clean, readable code that mirrors your DOM structure

---

### 2. Assertions

WebElement provides access to Playwright's assertion library through `.expect()` and `.softExpect()`.

#### Basic Assertions

```typescript
// Standard assertion - fails immediately on failure
await button.expect().toBeVisible();
await input.expect().toHaveValue('expected text');
await element.expect().toContainText('partial text');

// Soft assertion - collects failures, reports at end
await button.softExpect().toBeVisible();
await input.softExpect().toHaveValue('expected text');
```

#### Assertion Chaining

All standard Playwright matchers are available:

```typescript
await element.expect().toBeVisible();
await element.expect().toBeEnabled();
await element.expect().toBeDisabled();
await element.expect().toBeChecked();
await element.expect().toBeHidden();
await element.expect().toHaveText('exact text');
await element.expect().toContainText('partial text');
await element.expect().toHaveCount(3);
await element.expect().toHaveAttribute('class', 'active');
await element.expect().toHaveClass('btn-primary');
await element.expect().toHaveId('submit-button');
```

#### Negation

```typescript
await element.expect().not.toBeVisible();
await element.expect().not.toContainText('error');
await element.expect().not.toHaveClass('disabled');
```

#### Custom Messages

```typescript
await element.expect('Button should be visible').toBeVisible();
await element.softExpect('Input should have value').toHaveValue('expected');
```

**Important:** For `@playwright/test`, the ExpectProvider is configured automatically. For custom frameworks, see [Assertion Provider Configuration](#assertion-provider-configuration).

---

## Selector Building

### Using Playwright's `getBy*` Selectors

playwright-elements provides helper functions for Playwright's built-in locators:

```typescript
import { 
  $getByAltText, 
  $getByLabel, 
  $getByPlaceholder, 
  $getByRole, 
  $getByTestId, 
  $getByText, 
  $getByTitle 
} from 'playwright-elements';

const button = $getByRole('button', { name: 'Submit' });
const input = $getByLabel('Username');
const element = $getByTestId('login-form');
const link = $getByText('Click here');
const img = $getByAltText('Logo');
```

**Note:** The `getBy*` selectors cannot be used with the `.has()`, `.hasNot()`, `.hasText()`, or `.hasNotText()` methods. Use them only with the selectors created via `$()` or `new WebElement()`.

### Selector Chaining

Combine selectors to build complex queries:

```typescript
const button = $getByTestId('parentTestId').$('.child');

const element = $('.parent').with({
  subChild: $getByTestId('subChildId').$('.subChild2'),
});
```

---

## Filtering Elements

### Selector Filters

#### `and()` - Combine Selectors

```typescript
// Match both conditions
const button = $('button').and('[title="Submit"]');
const button2 = $getByRole('button').and($getByTitle('Submit'));

// Result: button[title="Submit"]
```

#### `or()` - Alternative Selectors

```typescript
// Match either selector
const button = $('button').or($('input[type="button"]'));

// Result: button, input[type="button"]
```

### Child Filters

#### `has()` - Filter by Child Element

```typescript
// Find elements that have a specific child
const fieldRows = $('.field-row').has($('input.enabled'));
const fieldRows2 = $('.field-row').has('input.enabled');
```

#### `hasNot()` - Filter by Absent Child

```typescript
// Find elements that don't have a specific child
const fieldRows = $('.field-row').hasNot($('input.disabled'));
const fieldRows2 = $('.field-row').hasNot('input.disabled');
```

### Text Filters

#### `hasText()` - Filter by Text Content

```typescript
// Find elements containing specific text
const paragraph = $('p').hasText('Some text:');

// With RegExp
const paragraph2 = $('p').hasText(/Some text:/);
```

#### `hasNotText()` - Filter by Absent Text

```typescript
// Find elements not containing specific text
const paragraph = $('p').hasNotText('Some text');

// With RegExp
const paragraph2 = $('p').hasNotText(/Some text/);
```

**Important:** All filter methods (`has`, `hasNot`, `hasText`, `hasNotText`) can be combined in chains:

```typescript
const filtered = $('.field-row')
  .hasText('Title:')
  .has('input.enabled');
```

---

## Working with Element Lists

### Position-Based Selection

#### `first()` and `last()`

```typescript
const items = $('.item');

// Get first element
await items.first().click();

// Get last element
await items.last().click();
```

#### `nth()` - Get by Index

```typescript
const items = $('.item');

// Get element at index 2
await items.nth(2).click();

// Get last element (equivalent to .last())
await items.nth(-1).click();
```

**Note:** By default, locators are in strict mode. Use `first()`, `last()`, or `nth()` to point to a specific element when you have multiple matches.

### List Operations

#### `getAll()` - Get All Elements

```typescript
const elements: WebElement[] = await $('.item').getAll();
```

#### `count()` - Count Elements

```typescript
const count = await $('.item').count();
```

### Iteration Methods

#### `syncForEach` - Sequential Iteration

Use for actions (click, hover, fill, etc.) that need to execute sequentially:

```typescript
const inputs = $('input');

await inputs.syncForEach(async (element) => {
  await element.fill('test value');
});
```

**Implementation:** Each callback is awaited in sequence: `for (const ele of list) { await action(ele); }`

#### `asyncForEach` - Parallel Iteration

Use for data collection (text extraction, attribute checking) where parallel execution is safe:

```typescript
const elements = $('.item');
const texts: (string | null)[] = [];

await elements.asyncForEach(async (e) => {
  texts.push(await e.textContent());
});
```

**Implementation:** All callbacks are collected into a Promise.all array for parallel execution.

### Transformation Methods

#### `map()` - Transform Elements

```typescript
const elements = $('.item');
const texts: (string | null)[] = await elements.map(async (e) => {
  return await e.textContent();
});
```

#### `filterElements()` - Filter by Predicate

```typescript
const elements = $('input');
const enabledInputs = await elements.filterElements(async (e) => {
  return await e.isEnabled();
});
```

With type safety for nested elements:

```typescript
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

#### `filter()` - Filter by Options

```typescript
const elements = $('div');
const filtered = elements.filter({
  has: '#id',
  hasNot: '.hidden',
  hasText: 'Visible target',
  hasNotText: 'Visible wrong target'
});
```

---

## Navigation & Relationships

### `parent()` - Access Parent Element

```typescript
const header = $('.header').with({
  logo: $('.logo'),
  login: $('#log-in')
});

// Access parent
const headerParent = header.logo.parent();

// With type annotation for type safety
const typedParent = header.login.parent<typeof header>();
```

**Important:** The `.parent()` method returns `undefined` when the element has no parent. Always check for undefined or use optional chaining:

```typescript
// Safe access
header.parent?.someMethod();

// Or check explicitly
const parent = header.parent;
if (parent) {
  await parent.someMethod();
}
```

### Content Frame and Owner

For working with iframes:

```typescript
const mainPage = $('.main');
const iframe = mainPage.contentFrame()
  .with({
    header: $('.header')
  });

// Switch to iframe context
await iframe.header.expect().toBeVisible();

// Switch back to parent context
iframe.owner(); // Returns locator in parent context
```

**Behind the scenes:** `page.frameLocator('#my-frame').locator('.header')`

---

## Advanced Selector Building

### `clone()` - Clone and Override

```typescript
const originElement = $('.button').hasText('Submit').hasNotText('Ok');

const overriddenElement = originElement.clone({
  selector: 'input[type=button]' 
}); 
// Still has hasText=Submit and hasNotText='Ok' but uses different selector
```

**Parameters:**
```typescript
clone<T extends WebElement>(options?: {
  selector?: string;
  hasLocator?: string;
  hasNotLocator?: string;
  hasText?: string | RegExp;
  hasNotText?: string | RegExp;
  nth?: number;
}): T
```

---

## Assertion Provider Configuration

Starting from version 1.18.3, assertions use a **provider pattern** that decouples WebElement from specific test frameworks.

### For Playwright Test (Automatic)

No configuration needed! It's handled automatically:

```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
  // Works automatically
  await $('.element').expect().toBeVisible();
});
```

### For Custom Frameworks

```typescript
import { WebElement } from 'playwright-elements';
import { myCustomExpect, myCustomSoftExpect } from 'my-test-framework';

// Configure once in your test setup
WebElement.setExpectProvider({
  expect: myCustomExpect,
  softExpect: myCustomSoftExpect
});

// Now all WebElement instances use your custom expect
await $('.element').expect().toBeVisible();
```

### ExpectProvider Interface

```typescript
export interface ExpectProvider {
  expect: (locator: any, message?: string) => any;
  softExpect: (locator: any, message?: string) => any;
}
```

### Migration from Previous Versions

**Before 1.18.3:** Assertions worked implicitly.

**After 1.18.3:** Explicit configuration required (automatic for `@playwright/test`).

**Backward Compatibility:** The `useExpect()` method is maintained but is now a no-op. Use `setExpectProvider()` instead.

### Error Handling

If not configured, you'll see:

```
Error: Assertion provider not configured. Call WebElement.setExpectProvider() in your test setup.
For Playwright: WebElement.setExpectProvider({ expect, softExpect: expect.soft });
```

---

## Extended Expect with Custom Matchers

### Adding Custom Matchers

```typescript
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

// Extend Playwright expect with custom matchers
const customExpect = expect.extend({
  async toHaveAriaLabel(locator: any, expected: string, options?: { timeout?: number }) {
    const actual = await locator.getAttribute('aria-label');
    return { 
      pass: actual === expected,
      message: () => `Expected aria-label to be ${expected}, but got ${actual}`
    };
  }
});

// Configure WebElement to use extended expect
WebElement.setExpectProvider({
  expect: customExpect,
  softExpect: customExpect.soft
});

// Now custom matcher works with full autocompletion
await $('.button').expect().toHaveAriaLabel('Submit');
```

### Custom WebElement with Extended Expect

For better autocompletion with many custom matchers:

```typescript
// customWebElement.ts
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

const customExpect = expect.extend({
  async toHaveAriaLabel(locator: any, expected: string) {
    // Custom matcher implementation
  }
});

export class CustomWebElement extends WebElement {
  public customExpect(message?: string) {
    return customExpect(this.locator, message);
  }
}

export function $(selector: string): CustomWebElement {
  return new CustomWebElement(selector);
}

// Usage in tests
import { test } from 'playwright-elements';
import { $ } from './customWebElement';

test('custom expect matcher', async ({ goto }) => {
  await goto('/');
  const header = $(`.navbar`);
  await header.customExpect().toHaveAriaLabel('Main');
});
```

---

## Locator Access

### `.locator` and `._` Getters

Both return the underlying Playwright Locator:

```typescript
const element = $('.button');

// Both do the same thing
await element.locator.click();
await element._.click();
```

Use these to access Playwright Locator methods not directly exposed by WebElement (like `evaluate`, `evaluateAll`, etc.).

---

## Actions (Playwright Locator Methods)

WebElement delegates all standard Playwright Locator methods. Here's a complete reference:

### Text & Content
- `allInnerTexts()` - Get all inner texts
- `allTextContents()` - Get all text contents
- `innerText()` - Get inner text
- `innerHTML()` - Get inner HTML
- `textContent()` - Get text content

### Attributes & Properties
- `getAttribute(name)` - Get attribute value
- `inputValue()` - Get input value
- `isChecked()` - Check if checked
- `isDisabled()` - Check if disabled
- `isEditable()` - Check if editable
- `isEnabled()` - Check if enabled
- `isHidden()` - Check if hidden
- `isVisible()` - Check if visible

### Actions
- `blur()` - Blur element
- `check()` - Check checkbox
- `click()` - Click element
- `dblclick()` - Double click
- `fill(value)` - Fill input
- `focus()` - Focus element
- `hover()` - Hover over element
- `press(key)` - Press key
- `selectOption(values)` - Select option
- `selectText()` - Select text
- `setChecked(checked)` - Set checked state
- `setInputFiles(files)` - Set input files
- `tap()` - Tap element
- `type(text)` - Type text
- `uncheck()` - Uncheck checkbox

### Advanced Actions
- `dispatchEvent(type, eventInit?, options?)` - Dispatch event
- `dragTo(target, options?)` - Drag to target
- `highlight()` - Highlight element (debugging)
- `pressSequentially(text, options?)` - Press keys sequentially
- `scrollIntoViewIfNeeded(options?)` - Scroll into view

### Screenshot & Visual
- `boundingBox()` - Get bounding box
- `screenshot(options?)` - Take screenshot

### Wait & Timing
- `waitFor(options?)` - Wait for element

### Count
- `count()` - Count matching elements

All methods support the same options as their Playwright Locator counterparts.

---

## Handlers

### `addHandler()` - Add Locator Handler

```typescript
// Simple port of Playwright's page.addLocatorHandler
await element.addHandler(async (locator) => {
  // Custom handler logic
}, { noWaitAfter: true, times: 1 });
```

### `removeHandler()` - Remove Locator Handler

```typescript
// Simple port of Playwright's page.removeLocatorHandler
await element.removeHandler();
```

---

## Get Text

### `getText()` - Safe Text Extraction

```typescript
// Wrapper on textContent with null check
const text = await element.getText();
```

If `textContent` returns null, `getText()` throws an error: `'Text content method returned null for selector: "img"'`

---

## How to Extend WebElement

Create custom element classes for your project's specific needs:

### Option 1: Extend Base Class with Factory

```typescript
import { WebElement } from 'playwright-elements';

class Field extends WebElement {
  public async set(value: string) {
    await this.fill("");
    await this.type(value, { delay: 50 });
  }
}

export function $field(selector: string): Field {
  return new Field(selector);
}

// Usage
import { $ } from 'playwright-elements';
import { $field } from './field.element';

const page = {
  form: $('.form').with({
    nameField: $field('.name-field'),
  })
};
```

### Option 2: Static Factory Method

```typescript
import { WebElement } from 'playwright-elements';

export class Input extends WebElement {
  public async set(value: string) {
    await this.fill("");
    await this.type(value, { delay: 50 });
  }
  
  static $(selector: string): Input {
    return new Input(selector);
  }
}

// Usage
import { $ } from 'playwright-elements';
import { Input } from './field.element';

const page = {
  form: $('.form').with({
    nameField: Input.$('.name-field'),
  })
};
```

---

## Best Practices

### 1. Use Type Annotations

Always use explicit types for better autocompletion and type safety:

```typescript
// Good
const button: WebElement = $('button');

// Better - with custom type for nested elements
const form = $('.form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
});
```

### 2. Use `with()` for Complex Components

Prefer `.with()` over manual type definitions:

```typescript
// Good
const header = $('.header').with({
  logo: $('.logo'),
  menu: $('.menu')
});

// Old way (still works but less type-safe)
const header2 = $('.header').subElements({
  logo: { selector: '.logo' },
  menu: { selector: '.menu' }
});
```

### 3. Use `this` Type Annotations

Always specify the `this` type in custom methods:

```typescript
// Good
async login(this: WebElement, username: string) {
  await this.username.fill(username);
}

// Bad (type error)
async login(username: string) {
  await this.username.fill(username);
}
```

### 4. Combine Selectors Judiciously

While you can chain many selectors, balance readability with specificity:

```typescript
// Good - clear and readable
const button = $('.button').hasText('Submit').has('.icon');

// Maybe too complex - consider breaking up
const element = $('.container').has($('.child')).hasText('Text').hasNot('.hidden').first();
```

### 5. Use Parent References for Sibling Access

When you need to access siblings in custom methods, use `.parent()`:

```typescript
const header = $('.header').with({
  userIcon: $('#icon'),
  login: $('#log-in').with({
    async goToLoginPage(this: WebElement) {
      await this.parent<typeof header>().userIcon.hover();
      await this.click();
    }
  })
});
```

---

[Go to Main Page >>](./../README.md)

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

> **Recommended Approach:** We recommend using the `.with()` method as the primary way to add sub-elements and custom methods. The `.with()` method combines the functionality of both `subElements()` and `withMethods()` in a single call, providing a cleaner and more unified API. 
> 
> **Backward Compatibility:** For existing projects, `subElements()` and `withMethods()` methods remain fully supported and will continue to work. You can migrate to `.with()` at your own pace.

---

## Assertion Provider Configuration

#### Configuration Methods

**For Playwright Test (Automatic):**
> No manual setup needed! Configuration happens automatically in `playwright.test.fixtures.ts`

```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
    // Works automatically - no configuration needed
    await $('.element').expect().toBeVisible();
});
```

**For Custom Matchers Recognition:**
```typescript
import { WebElement } from 'playwright-elements';
import { myCustomExpect, myCustomSoftExpect } from 'my-test-framework';

// Configure once in setup
WebElement.setExpectProvider({
    expect: myCustomExpect,
    softExpect: myCustomSoftExpect
});

// Now all WebElement instances use your custom expect
await $('.element').expect().toBeVisible();
```

### Important Notes

⚠️ **Error if not configured:**
```typescript
// This will throw an error:
await $('.element').expect().toBeVisible();
// Error: "Assertion provider not configured. Call WebElement.setExpectProvider() in your test setup.
//        For Playwright: WebElement.setExpectProvider({ expect, softExpect: expect.soft });"
```

✅ **Solution:** Ensure you're using Playwright Test fixtures.

### Migration from Previous Versions

**Before 1.18.3 (automatic, implicit):**
```typescript
await $('.element').expect().toBeVisible(); // Just worked
```

**After 1.18.3 (explicit configuration):**
```typescript
// For Playwright Test: Automatic (no changes needed)
await $('.element').expect().toBeVisible(); // Works automatically
```

### Backward Compatibility

The `useExpect()` static method is **maintained for backward compatibility** but is now a **no-op** (does nothing):

```typescript
// This still works but does nothing:
WebElement.useExpect(expect);

// Use this instead:
WebElement.setExpectProvider({ expect, softExpect: expect.soft });
```

---

### Expect
Web element has methods `expect()` and `softExpect()` which allows access to
[playwright assert library](https://playwright.dev/docs/test-assertions).

> ⚠️ **REQUIRES CONFIGURATION:** Before using `expect()` or `softExpect()`, you must [configure the assertion provider](#assertion-provider-configuration).

Please pay attention that Locator passed to native expect method under the hood
that's why autocomplete works only for default locator matchers but pay attention that it allows you to call
custom matchers without errors.

#### Basic Usage

```typescript
import { $ } from 'playwright-elements';

// For Playwright Test: Works automatically

const element = $('.my-element');

// Standard assertion
await element.expect().toBeVisible();

// Soft assertion (doesn't fail immediately)
await element.softExpect().toHaveText('Hello');
```

#### Assertion Chaining

All standard Playwright assertion matchers are available:

```typescript
await element.expect().toHaveValue('test');
await element.expect().toContainText('hello');
await element.expect().toHaveAttribute('class', 'active');
await element.expect().toBeEnabled();
await element.expect().toBeDisabled();
await element.expect().toBeChecked();
await element.expect().toBeHidden();
await element.expect().toHaveCount(3);
await element.expect().toHaveClass('btn-primary');
await element.expect().toHaveId('submit-button');
```

#### Negation with `not`

```typescript
await element.expect().not.toBeVisible();
await element.expect().not.toContainText('error');
await element.expect().not.toHaveClass('disabled');
```

#### Soft Assertions

Soft assertions collect failures and report them at the end of the test:

```typescript
test('multiple checks', async () => {
    await $('.name').softExpect().toHaveValue('John');
    await $('.email').softExpect().toHaveValue('john@example.com');
    await $('.age').softExpect().toHaveValue('30');
    
    // All three assertions are checked, test fails if any fail
});
```

#### Custom Messages

```typescript
await element.expect('Header should be visible').toBeVisible();
await element.softExpect('User name should match').toHaveText('John Doe');
```

#### Type Safety

The return type of `expect()` and `softExpect()` is `any` to support the full Playwright assertion chain. For better type safety with custom matchers, see [Extended Expect](#extended-expect).

### Extended Expect

> **Note:** With the new ExpectProvider pattern (v1.18.3+), custom matchers should be configured through the provider rather than directly extending expect.

WebElement allows users to use custom matchers with the new provider pattern. For full type safety and autocompletion with custom matchers, configure them through the ExpectProvider.

Related Playwright docs: https://playwright.dev/docs/next/test-assertions#add-custom-matchers-using-expectextend

#### Adding Custom Matchers with ExpectProvider

**Recommended approach with ExpectProvider:**

```typescript
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

// Extend Playwright expect with custom matchers
const customExpect = expect.extend({
    async toHaveAriaLabel(locator: any, expected: string, options?: { timeout?: number }) {
        const actual = await locator.getAttribute('aria-label');
        return { 
            pass: actual === expected,
            message: () => `Expected aria-label to be ${expected}, but got ${actual}`
        };
    }
});

// Configure WebElement to use extended expect
WebElement.setExpectProvider({
    expect: customExpect,
    softExpect: customExpect.soft
});

// Now custom matcher works with full autocompletion
await $('.button').expect().toHaveAriaLabel('Submit');
```

#### Custom WebElement with Extended Expect

If you have many custom matchers and want better autocompletion:

```typescript
// customWebElement.ts
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

const customExpect = expect.extend({
    async toHaveAriaLabel(locator: any, expected: string) {
        // Custom matcher implementation
    }
});

export class CustomWebElement extends WebElement {
    public customExpect(message?: string) {
        return customExpect(this.locator, message);
    }
}

export function $(selector: string): CustomWebElement {
    return new CustomWebElement(selector);
}
```

```typescript
// someTest.test.ts
import { test } from 'playwright-elements';
import { $ } from './customWebElement';

test('custom expect matcher', async ({ goto }) => {
    await goto('/');
    const header = $(`.navbar`);
    await header.customExpect().toHaveAriaLabel('Main');
});
```

> **Note:** The old approach of directly calling `expect.extend()` and using WebElement's built-in expect methods will **not work** with custom matchers unless you configure the provider with your extended expect.

---


### ExpectProvider

> Interface for providing assertion functionality to WebElement. Used to decouple from specific test frameworks.

```typescript
export interface ExpectProvider {
    expect: (locator: any, message?: string) => any;
    softExpect: (locator: any, message?: string) => any;
}
```

---

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
`parent<T>(this: WebElement): WebElement & T` method allows you to get the parent element and extend its type.

Allows access to parent element from a child element.

> **Important:** The `parent()` method returns `undefined` when the element has no parent (i.e., it's a root-level element). The return type `WebElement & T` is a simplification for convenience. In practice, you should use optional chaining or check for undefined:

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
                      await this.parent<typeof header>().userIcon.hover();
                      await this.click();
                  } 
             })
    });
```
**Checking for undefined parent:**
```ts
import { $, WebElement } from "playwright-elements";

test(`get parent`, () => {
  const header = $('.header');
  // Use optional chaining for safe access
  header.parent?.someMethod();
  
  // Or check explicitly
  const parent = header.parent;
  if (parent) {
    await parent.someMethod();
  }
  
  // Without parent, returns undefined
  expect(header.parent).toBeUndefined();
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

> **Important:** The `has()`, `hasNot()`, `hasText()`, and `hasNotText()` methods **cannot be used with Playwright's `getBy*` selectors** (i.e., elements created with `$getByAltText`, `$getByLabel`, `$getByRole`, etc.). These filtering methods only work with CSS selectors created via `$()` or `new WebElement()`. If you attempt to use them with a `getBy*` element, you will get an error: `"has option can not be used with ${ByMethod}, it can be used only with $ or new WebElement('#id') syntax."`

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
    private readonly enabledInputs = $(`input.enabled`);
    readonly fieldRows = $(`.field-row`).has(enabledInputs);
}
```

### Has not
Method `hasNot(selector: string | WebElement)` helps to find elements without specific child.

> **Important:** See the note under [Has](#has) - this method also cannot be used with Playwright's `getBy*` selectors.

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
    private readonly disabledInputs = $(`input.disabled`);
    readonly fieldRows = $(`.field-row`).hasNot(disabledInputs);
}
```

### Has text
Method `hasText(text: string | RegExp)` helps to find elements with specific text or child with text.

> **Important:** See the note under [Has](#has) - this method also cannot be used with Playwright's `getBy*` selectors.
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

> **Important:** See the note under [Has](#has) - this method also cannot be used with Playwright's `getBy*` selectors.
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
  await mainPage.errors.last().expect().toHaveText("Incorrect password");
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
  await mainPage.iframe.header.expect().toBeVisible();
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
const overriddenElement = originElement.clone({ selector: 'input[type=button]' }); // will still hasText=Submit and hasNotText='Ok' but will use another selector.
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