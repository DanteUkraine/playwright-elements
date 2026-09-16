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

**Note:** Custom matchers added via `expect.extend()` work automatically with WebElement.expect() and provide full TypeScript autocomplete.

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

## Assertions

WebElement provides seamless integration with @playwright/test's assertion system. Custom matchers added via `expect.extend()` work automatically.

### Basic Usage

No configuration needed - assertions work automatically with @playwright/test:

```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
  await $('.element').expect().toBeVisible();
  await $('.element').softExpect().toBeVisible();
});
```

### Custom Matchers

Extend Playwright's expect with custom matchers - they will automatically work with WebElement:

```typescript
import { expect } from '@playwright/test';
import { $ } from 'playwright-elements';

// Extend expect with custom matcher
expect.extend({
  async toHaveCustomValue(locator, expected) {
    const actual = await locator.getAttribute('data-custom');
    return {
      pass: actual === expected,
      message: () => `Expected custom value to be ${expected}, but got ${actual}`
    };
  }
});

// Custom matcher works with full TypeScript autocomplete
await $('.element').expect().toHaveCustomValue('test');
```

**How it works:** WebElement.expect() directly uses @playwright/test's expect, so any matchers added via `expect.extend()` are automatically available with full TypeScript type safety.

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

// No configuration needed! Custom matchers work automatically with WebElement
// because WebElement.expect() directly uses @playwright/test's expect
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

---

[Go to Main Page >>](./../README.md)

