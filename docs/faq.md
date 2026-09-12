---
layout: default
title: FAQ & Troubleshooting
---
[Go to Main Page >>](./../README.md)

# Frequently Asked Questions

This page contains answers to common questions about playwright-elements. If you don't find your answer here, please [open an issue](https://github.com/DanteUkraine/playwright-elements/issues) or [start a discussion](https://github.com/DanteUkraine/playwright-elements/discussions).

---

## General Questions

### What is playwright-elements?

Playwright-elements is a TypeScript framework that extends Playwright with additional features for building maintainable, type-safe end-to-end tests. It provides:

- **Reusable Components**: Build hierarchical UI components with child elements
- **Type Safety**: Full TypeScript support with branded types for test IDs
- **Chainable API**: Fluent interface mixing selectors with synchronous methods
- **Test ID System**: Type-safe, collision-resistant test ID generation
- **Page Object Pattern**: Clean architecture for maintainable tests

### How does it compare to pure Playwright?

| Feature | Pure Playwright | playwright-elements |
|---------|----------------|---------------------|
| Type Safety | Limited | Full TypeScript with branded types |
| Component Structure | Manual | Built-in with `with()` method |
| Test IDs | Basic `getByTestId` | Type-safe system with factories |
| Page Objects | Manual setup | Automatic with `buildPageObject` |
| Learning Curve | Low | Medium (but worth it for large projects) |
| Boilerplate | More | Less |

**Use pure Playwright if:**
- You have simple tests or one-off scripts
- You don't need reusable components
- You're not using TypeScript

**Use playwright-elements if:**
- You have complex applications with many reusable components
- You want type safety and maintainability
- You follow Page Object Pattern or Component-Driven Testing
- You have a team working on tests

### Do I need to know Playwright first?

Yes, we recommend completing the [Playwright Getting Started](https://playwright.dev/docs/intro) first. Playwright-elements builds on top of Playwright, so understanding the basics will help you get the most out of it.

### Can I use it with other test frameworks?

Yes! While playwright-elements works seamlessly with `@playwright/test`, it can also be used with other frameworks like Jest, Mocha, or custom setups. You'll need to configure the `ExpectProvider` for assertions to work.

---

## Installation & Setup

### I installed playwright-elements but my tests don't work

Make sure you:

1. Installed the package: `npm install -D playwright-elements`
2. Import from the correct module: `import { test } from 'playwright-elements'`
3. Have Playwright installed: `npm init playwright@latest`

### I get "Assertion provider not configured" error

This means the `ExpectProvider` is not configured. For `@playwright/test`, this happens automatically. If you're using a custom framework:

```typescript
import { WebElement } from 'playwright-elements';
import { myExpect, mySoftExpect } from 'my-framework';

WebElement.setExpectProvider({
  expect: myExpect,
  softExpect: mySoftExpect
});
```

### Can I use it without TypeScript?

Technically yes, but you'll lose the main benefits (type safety, autocompletion). We strongly recommend using TypeScript.

### What version of Playwright do I need?

Playwright-elements works with Playwright 1.30+. We recommend using the latest version.

---

## WebElement Questions

### What's the difference between `$()` and `new WebElement()`?

They're the same. `$()` is just a shortcut:

```typescript
// These are equivalent
const element1 = $('button');
const element2 = new WebElement('button');
```

### How do I access the underlying Playwright Locator?

Use the `.locator` or `._` getter:

```typescript
const element = $('.button');

// Both return the underlying Playwright Locator
await element.locator.click();
await element._.click();
```

### Can I use Playwright's `getBy*` selectors?

Yes! playwright-elements provides helper functions:

```typescript
import { $getByTestId, $getByRole, $getByLabel, $getByText } from 'playwright-elements';

const button = $getByRole('button', { name: 'Submit' });
const input = $getByLabel('Username');
```

**Important:** Some WebElement methods like `has()`, `hasNot()`, `hasText()` cannot be used with `getBy*` selectors. Use them only with `$()` or `new WebElement()`.

### How do I create nested components?

Use the `.with()` method:

```typescript
const app = $('.app').with({
  header: $('.header').with({
    logo: $('.logo'),
    navigation: $('.nav').with({
      items: $('.nav-item')
    })
  }),
  main: $('.main-content')
});

// Access nested elements
await app.header.navigation.items.first().click();
```

### How do I add custom methods?

Add them inside the `.with()` method:

```typescript
const form = $('.login-form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  
  async login(this: WebElement, username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
});

// Usage
await form.login('admin', 'password123');
```

### How do I filter elements?

Use the filtering methods:

```typescript
// Filter by text
const visibleButtons = $('button').hasText('Submit');

// Filter by child element
const rowsWithCheckbox = $('.row').has('$("input[type=checkbox]")');

// Filter by attribute
const disabledButtons = $('button').hasNot('[disabled]');

// Combine filters
const filtered = $('.item').hasText('Active').has('.icon');
```

### How do I work with lists?

Use the list methods:

```typescript
const items = $('.item');

// Get all elements
await items.getAll();

// Get first/last
await items.first().click();
await items.last().click();

// Get by index
await items.nth(2).click();

// Filter
await items.filter({ hasText: 'Important' });
```

### How do I iterate over elements?

Use `syncForEach` for actions (click, hover, etc.) and `asyncForEach` for data collection:

```typescript
// For actions (sequential)
await elements.syncForEach(async (e) => {
  await e.click();
});

// For data collection (parallel)
const texts = [];
await elements.asyncForEach(async (e) => {
  texts.push(await e.textContent());
});
```

### How do I access parent elements?

Use the `.parent()` method:

```typescript
const child = $('.child');
const parent = child.parent<{ sibling: WebElement }>();

// Access sibling through parent
if (parent) {
  await parent.sibling.click();
}
```

**Note:** `.parent()` returns `undefined` if the element has no parent.

---

## Test IDs Questions

### Why use Test IDs instead of CSS selectors?

Test IDs provide:

1. **Stability**: Less likely to break when CSS changes
2. **Clarity**: Explicit purpose (`data-testid="login-button"` vs `.btn:first-child`)
3. **Type Safety**: Prevent typos with TypeScript
4. **Autocompletion**: IDE support for available IDs

### How do I create a Test ID?

```typescript
import { sid, factory } from 'playwright-elements';

// Static ID
const buttonId = sid<'button'>('submit-button');

// Factory for dynamic IDs
const button = factory<'button'>('btn');
const submitId = button('submit'); // 'btn-submit'
```

### How do I use Test IDs in React components?

```tsx
import { testIdProps } from 'playwright-elements';
import { ids } from './testIds';

function MyButton() {
  return <button {...testIdProps(ids.button.submit)}>Submit</button>;
}
```

This spreads `data-testid="btn-submit"` onto the element.

### How do I select elements by Test ID?

```typescript
import { $byTestId, $byTestIdPrefix } from 'playwright-elements';

// Exact match
const button = $byTestId(ids.button.submit);

// Prefix match (all buttons)
const allButtons = $byTestIdPrefix(buttonFactory);
```

### What's the difference between `$byTestId` and Playwright's `getByTestId`?

`$byTestId` creates a CSS selector (`[data-testid="..."`]) while Playwright's `getByTestId` uses a native locator. The CSS approach:

1. Works when passing selectors to `page.locator()`
2. Is consistent with other selector types
3. Can be composed with other selectors

The exact-match semantics are identical.

### Can I use Test IDs without the full playwright-elements?

Yes! Import from the lightweight subpath:

```typescript
import { sid, factory, testIdProps } from 'playwright-elements/testids';
```

This has zero dependencies on Playwright.

### How do I validate my Test IDs?

Use `assertNoPrefixCollisions`:

```typescript
import { assertNoPrefixCollisions, factory, sid } from 'playwright-elements';

const ids = {
  button: factory<'button'>('btn'),
  nav: {
    item: sid<'nav.item'>('btn-item'), // This will cause a collision!
  }
} as const;

// This will throw an error if collisions are detected
assertNoPrefixCollisions(ids);
```

---

## Page Objects & Fixtures

### How do I create a page object?

```typescript
import { $ } from 'playwright-elements';

export class LoginPage {
  readonly usernameField = $('input[name="username"]');
  readonly passwordField = $('input[name="password"]');
  readonly submitButton = $('button[type="submit"]');

  async login(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
}
```

### How do I use `buildPageObject`?

```typescript
// pages/index.ts
export class HomePage { /* ... */ }
export class LoginPage { /* ... */ }

// fixtures.ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import * as pageObjectModule from './pages';

export const test = baseTest.extend({
  pageObject: [
    async ({}, use) => {
      await use(buildPageObject(pageObjectModule));
    },
    { scope: 'test' }
  ],
});

// Usage in tests
test('my test', async ({ pageObject }) => {
  await pageObject.login.login('admin', 'password');
});
```

### What does `buildPageObject` do with class names?

By default, it:
- Removes the `Page` suffix
- Converts to lowercase

```typescript
// Class: HomePage -> pageObject.home
// Class: LoginPage -> pageObject.login
// Class: UserSettingsPage -> pageObject.userSettings
```

You can customize this:

```typescript
// Keep full class name
buildPageObject(module, { suffix: '' });
// pageObject.HomePage

// Preserve casing
buildPageObject(module, { lowerCaseFirst: false });
// pageObject.Login
```

### How do I generate index files?

Use the CLI:

```bash
# One-time generation
npx generate-index ./src

# With watch mode
npx generate-index ./src --watch true

# With double quotes
npx generate-index ./src --quotes '"'
```

Or programmatically:

```typescript
import { generateIndexFile } from 'playwright-elements';

generateIndexFile('./pages', {
  watch: true,
  cliLog: false,
  quotes: '"'
});
```

---

## Assertions & Expectations

### Why do I get "Assertion provider not configured"?

The `ExpectProvider` is not configured. For `@playwright/test`, this is automatic. For custom setups:

```typescript
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

WebElement.setExpectProvider({
  expect,
  softExpect: expect.soft
});
```

### How do I use custom matchers?

```typescript
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

const customExpect = expect.extend({
  async toHaveAriaLabel(locator, expected) {
    const actual = await locator.getAttribute('aria-label');
    return {
      pass: actual === expected,
      message: () => `Expected aria-label to be ${expected}, but got ${actual}`
    };
  }
});

WebElement.setExpectProvider({
  expect: customExpect,
  softExpect: customExpect.soft
});

// Now use your custom matcher
await $('.button').expect().toHaveAriaLabel('Submit');
```

### What's the difference between `expect()` and `softExpect()`?

- `expect()`: Fails immediately on assertion failure
- `softExpect()`: Collects failures and reports at the end of the test

```typescript
test('soft assertions', async () => {
  await $('.name').softExpect().toHaveValue('John');
  await $('.email').softExpect().toHaveValue('john@example.com');
  await $('.age').softExpect().toHaveValue('30');
  
  // All three assertions are checked
  // Test fails if any fail, but continues executing all assertions
});
```

---

## Browser & Navigation

### How do I use the `goto` fixture?

```typescript
import { test } from 'playwright-elements';

test('navigation', async ({ goto }) => {
  await goto('/login');
  // Or with base URL
  await goto('/');
});
```

### How do I switch between tabs?

```typescript
import { BrowserInstance } from 'playwright-elements';

test('tab switching', async () => {
  await BrowserInstance.switchToPreviousTab();
  await BrowserInstance.switchToTabByIndex(1);
  await BrowserInstance.switchToTabByTitle('Settings');
});
```

### How do I access the current page?

```typescript
import { BrowserInstance } from 'playwright-elements';
import { expect } from '@playwright/test';

await expect(BrowserInstance.currentPage).toHaveURL('/dashboard');
```

---

## Troubleshooting

### Tests work locally but fail in CI

**Possible causes:**
1. Missing test setup file in CI configuration
2. Different environment variables
3. Different Node.js version

**Solutions:**
- Ensure your CI includes the setup file
- Check environment variables are set
- Use the same Node.js version as locally

### Selector not found / Element not visible

**Check:**
- The element exists in the DOM
- The element is visible (not hidden by CSS)
- Your selector is correct
- The page has fully loaded

**Debug:**
```typescript
// Check if element exists
const count = await $('.button').count();

// Wait for element to be visible
await $('.button').waitFor();

// Use Playwright's debug tools
await $('.button').highlight();
```

### Type errors with `this` in custom methods

Make sure to use the correct `this` type:

```typescript
// Correct
async login(this: WebElement, username: string) {
  await this.username.fill(username);
}

// Wrong (missing this parameter)
async login(username: string) {
  await this.username.fill(username); // Type error
}
```

### Cannot use `has()` with `getBy*` selectors

This is by design. Use `has()` only with `$()` or `new WebElement()`:

```typescript
// Correct
const element = $('div').has('span');

// Wrong
const element = $getByRole('div').has('span'); // Error
```

### Index generation not working

**Check:**
- The folder path is correct
- You have write permissions
- There are TypeScript files in the folder
- You're not excluding the folder in tsconfig

**Solution:**
```typescript
// Be explicit about the path
const manager = generateIndexFile('./src/pages', { watch: true, cliLog: true });

// Check for errors
if (manager.watchers.length === 0) {
  console.log('No watchers created - check your path');
}
```

---

## Best Practices

### How should I organize my tests?

We recommend:

```
test/
├── pages/          # Page objects
├── components/     # Reusable components
├── testIds/        # Test ID definitions
├── fixtures/       # Custom fixtures
├── utils/          # Test utilities
└── specs/          # Test files
```

### Should I use Page Objects or Component-Driven Testing?

| Approach | When to Use |
|----------|--------------|
| **Page Objects** | Traditional page-based testing |
| **Component-Driven** | React/Vue/Angular apps with reusable components |
| **Hybrid** | Use both - page objects for pages, components for reusable UI elements |

### How do I share code between tests?

Use custom fixtures:

```typescript
// fixtures.ts
import { test as baseTest } from 'playwright-elements';

export const test = baseTest.extend({
  auth: [
    async ({}, use) => {
      await use(new AuthHelper());
    },
    { scope: 'test' }
  ]
});

// In tests
test('my test', async ({ auth }) => {
  await auth.loginAsAdmin();
});
```

### How do I handle dynamic content?

Use factories and prefix selectors:

```typescript
const item = factory<'list.item'>('list-item');

// In component
<div {...testIdProps(item(product.id))} />

// In test
const allItems = $byTestIdPrefix(item);
await allItems.filter({ hasText: 'Product 123' }).first().click();
```

---

## Contributing & Support

### How do I report a bug?

1. Check the [FAQ](#) and [Troubleshooting](#troubleshooting) sections
2. Search existing [issues](https://github.com/DanteUkraine/playwright-elements/issues)
3. Create a minimal reproduction
4. Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Version information (Node.js, npm, playwright-elements)

### How do I request a feature?

1. Check existing [feature requests](https://github.com/DanteUkraine/playwright-elements/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Open a new issue with the [feature request template](https://github.com/DanteUkraine/playwright-elements/issues/new?assignees=&labels=enhancement&template=feature_request.md)

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:unit`
5. Submit a pull request

See [CONTRIBUTING.md](https://github.com/DanteUkraine/playwright-elements/CONTRIBUTING.md) for details.

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

[Go to Main Page >>](./../README.md)
