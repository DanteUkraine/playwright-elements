# Playwright-elements

[![Awesome](https://awesome.re/mentioned-badge.svg)](https://github.com/mxschmitt/awesome-playwright/blob/master/README.md#utils)

**Playwright-elements** is a powerful testing framework that extends Playwright with:

- **Reusable Components** - Build hierarchical UI components with child elements
- **Type Safety** - Full TypeScript support with branded types for test IDs
- **Chainable API** - Fluent interface mixing selectors with synchronous methods
- **Test ID System** - Type-safe, collision-resistant test ID generation with production stripping
- **Page Object Pattern** - Clean architecture for maintainable tests

---

## Installation

```bash
npm install -D playwright-elements
```

For projects that only need test ID generation without Playwright:

```bash
npm install -D @playwright-elements/testids
```

---

## Quick Start

```typescript
import { $, test } from 'playwright-elements';

const loginForm = $('.login-form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }
});

test('user login', async ({ goto }) => {
  await goto('/login');
  await loginForm.login('admin', 'password123');
  await loginForm.submit.expect().toBeVisible();
});
```

---

## 🏗️ Core Concepts

### Component Hierarchy
Create nested component structures that mirror your application's DOM:

```typescript
// Multi-level component structure
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

// Usage in tests
await app.header.navigation.items.first().click();
```

### Type-Safe Test IDs
Prevent selector typos and ensure type safety across your entire test suite using **branded types**:

```typescript
import { factory, sid, bareFactory, $byTestId, testIdProps, assertNoPrefixCollisions } from 'playwright-elements';

// Define typed IDs with branded types for compile-time safety
const ids = {
  login: {
    username: sid<'login.username'>('username-input'),
    password: sid<'login.password'>('password-input'),
  },
  button: factory<'button'>('btn')
} as const;

// Validate no prefix collisions at module load time
assertNoPrefixCollisions(ids);

// Use in React/Vue/Angular components
function MyComponent() {
  return <input {...testIdProps(ids.login.username)} />;
}

// Use in tests
const usernameField = $byTestId(ids.login.username);
await usernameField.fill('admin');

// bareFactory for entity-based IDs (no prefix)
const ruleRow = bareFactory<'rules.row'>();
// Usage: ruleRow(123) -> TestId<'rules.row'> with value '123'
```

**Benefits of Branded Types:**
- **Compile-time safety**: TypeScript prevents mixing IDs from different categories
- **Autocompletion**: IDE suggests available IDs with correct types
- **Refactoring support**: Change ID types in one place, errors appear throughout
- **Zero runtime overhead**: All types are erased at compile time

**Zero-dependency import:** For projects that only need the test IDs module without Playwright dependencies:

**Option 1 — Standalone package (recommended for unit tests and production code):**
```bash
npm install -D @playwright-elements/testids
```
```typescript
import { sid, factory, bareFactory, testIdProps } from '@playwright-elements/testids';
```
This installs a separate package with **zero runtime dependencies** — no Playwright, no lodash in `node_modules`.

**Option 2 — Subpath re-export (backward compatible):**
```typescript
import { sid, factory, bareFactory, testIdProps } from 'playwright-elements/testids';
```
This has **zero import-time dependencies** (loads no Playwright at runtime) but still installs the full `playwright-elements` package.

---

### Advanced Component Methods

The `.with()` method supports both elements and methods for complete component encapsulation:

```typescript
const loginForm = $('.login-form').with({
  // Child elements
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
  
  // Methods for component actions
  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }
});

// Usage
await loginForm.login('admin', 'password123');
```

---

### Browser and Page Management

Access the current page and context through `BrowserInstance`:

```typescript
import { BrowserInstance, $, usePage, test } from 'playwright-elements';

// Get the current page
const currentPage = BrowserInstance.currentPage;

// Check if running in mobile context (uses Playwright's public isMobile fixture)
if (BrowserInstance.isContextMobile) {
  // Mobile-specific logic
}

// Use with custom pages - execute code in specific page context
const result = await usePage(customPage, async () => {
  // All playwright-elements operations here use the provided page
  const element = $('.my-element');
  await element.click();
  return await element.textContent();
});

// In Playwright Test, isContextMobile is automatically set from the test fixture
test.use({ ...devices['iPhone 13'] });
test('mobile test', async ({}) => {
  // BrowserInstance.isContextMobile will be true
});
```

---

### Assertion Configuration

WebElement provides seamless integration with `@playwright/test` assertions. No configuration needed!

#### Automatic Setup
When importing from `'playwright-elements'`, assertions work automatically:

```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
  // Works automatically
  await $('.element').expect().toBeVisible();
  await $('.element').softExpect().toBeVisible();
});
```

#### Custom Matchers
Extend Playwright's expect with custom matchers - they will work automatically with WebElement:

```typescript
import { expect } from '@playwright/test';
import { test } from 'playwright-elements';
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

test('custom matcher', async ({ goto }) => {
  await goto('/');
  // Custom matcher works with full TypeScript autocomplete
  await $('.element').expect().toHaveCustomValue('test');
});
```

**How it works:** WebElement.expect() directly uses @playwright/test's expect, so any matchers added via `expect.extend()` are automatically available.

---

### Advanced Selectors

Filter elements by text and other criteria:

```typescript
// Filter by text content
const items = $('.item').filter({ hasText: 'Product' });

// Get all matching elements
const allButtons = $('.button').getAll();

// Chain filters
const visibleProducts = $('.product')
  .filter({ hasText: /Product/ })
  .filter({ isVisible: true });
```

---

### Accessing Underlying Playwright Locator

Every WebElement has a `.locator` property that provides access to the underlying Playwright Locator. Use this to access Playwright methods not directly exposed by WebElement:

```typescript
// Access the underlying Playwright Locator
const element = $('.my-element');
const locator = element.locator;

// Use Playwright methods directly
const value = await locator.evaluate((el) => el.getAttribute('data-value'));
const boundingBox = await locator.boundingBox();
const screenshot = await locator.screenshot();

// Or use the shorthand alias
const result = await element._.evaluate((el) => el.textContent);
```

**Common use cases:**
- Measuring element geometry with `boundingBox()`
- Reading computed styles with `evaluate()`
- Taking element screenshots with `screenshot()`
- Accessing multi-node relationships in one round trip

---

### Utility Functions

Generate index files and initialize test environments:

```typescript
import { generateIndexFile, initDesktopOrMobile } from 'playwright-elements';

// Generate index.ts files in a directory
generateIndexFile('./test', { watch: false });

// Initialize test environment for desktop or mobile
initDesktopOrMobile('desktop');
```

Use the CLI for index generation:
```bash
npx generate-index ./test
```

### Page Object Pattern
Traditional page object approach with automatic instantiation:

```typescript
// pages/loginPage.ts
import { $ } from 'playwright-elements';

export class LoginPage {
  readonly header = $('.header').with({
    logo: $('.header-logo'),
    avatar: $('.avatar')
  });
  
  readonly form = $('.login-form').with({
    usernameInput: $('input[name="username"]'),
    passwordInput: $('input[name="password"]'),
    loginButton: $('button[type="submit"]'),
    async fillForm(userName: string, password: string) {
      await this.usernameInput.fill(userName);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    }
  });
}

// fixtures.ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import * as pageObjectModule from '../pages';

type TestFixtures = { pageObject: PageObject<typeof pageObjectModule> };

export const test = baseTest.extend<TestFixtures>({
  pageObject: [async ({}, use) => {
    // IMPORTANT: First parameter MUST use object destructuring pattern
    // async (_deps, use) => { ... } will fail at collection time
    await use(buildPageObject(pageObjectModule));
  }, { scope: 'test' }],
});

// test.ts
test('check login page', async ({ pageObject }) => {
  await pageObject.login.form.fillForm('UserName', 'Pass!');
  await pageObject.login.header.logo.expect().toBeVisible();
  await pageObject.login.header.avatar.expect().toBeVisible();
});
```

### Type-Safe Test IDs with playwright-elements
Use type-safe test IDs with playwright-elements component structure:

```typescript
// testIds.ts
import { factory, sid } from 'playwright-elements';

export const ids = {
  login: {
    usernameInput: sid<'login.username'>('username-input'),
    passwordInput: sid<'login.password'>('password-input'),
    submitButton: sid<'login.submit'>('submit-button'),
  },
  header: {
    logo: sid<'header.logo'>('header-logo'),
  },
} as const;

// components/LoginForm.tsx
import { testIdProps } from 'playwright-elements';
import { ids } from '../testIds';

export function LoginForm() {
  return (
    <form>
      <input {...testIdProps(ids.login.usernameInput)} type="text" />
      <input {...testIdProps(ids.login.passwordInput)} type="password" />
      <button {...testIdProps(ids.login.submitButton)} type="submit">Login</button>
    </form>
  );
}

// elements.ts - define component structure using test IDs
import { $, $byTestId } from 'playwright-elements';
import { ids } from './testIds';

export const loginForm = $('.form-login').with({
  usernameInput: $byTestId(ids.login.usernameInput),
  passwordInput: $byTestId(ids.login.passwordInput),
  submitButton: $byTestId(ids.login.submitButton),
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
});

export const header = $('.app-header').with({
  logo: $byTestId(ids.header.logo)
});

// tests/login.spec.ts
import { test } from 'playwright-elements';
import { loginForm, header } from '../elements';

test('login form submission', async ({ goto }) => {
  await goto('/login');
  await loginForm.login('admin', 'password123');
  await header.logo.expect().toBeVisible();
});
```

See [Test IDs Module](https://danteukraine.github.io/playwright-elements/docs/test_ids.html) for complete documentation.

---

## 🎯 Use Cases

### ✅ When to Use playwright-elements:
- **Complex Applications** with many reusable components
- **Teams** needing maintainable, type-safe test code
- **Large Test Suites** requiring clean architecture
- **React/Vue/Angular** applications with component-driven testing
- **Migration from Selenium** or other frameworks

### ❌ When NOT to Use:
- Simple scripts or one-off tests
- Projects already committed to pure Playwright
- Non-TypeScript projects (limited benefit)

---

## Documentation

| Section | Description |
|---------|-------------|
| [Get Started](https://danteukraine.github.io/playwright-elements/docs/get_started.html) | Installation and basic usage |
| [Web Element](https://danteukraine.github.io/playwright-elements/docs/web_element.html) | Complete WebElement API reference |
| [Test IDs](https://danteukraine.github.io/playwright-elements/docs/test_ids.html) | Type-safe test ID system with production stripping |
| [Page Objects](https://danteukraine.github.io/playwright-elements/docs/build_page_object.html) | Page object pattern guide |
| [Fixtures](https://danteukraine.github.io/playwright-elements/docs/playwright_elements_fixtures.html) | Test fixture configuration |
| [Browser Management](https://danteukraine.github.io/playwright-elements/docs/browser_instance.html) | Advanced browser control |
| [Architecture](https://danteukraine.github.io/playwright-elements/docs/architecture.html) | Framework design principles |
| [Best Practices](https://danteukraine.github.io/playwright-elements/docs/best_practices.html) | Recommended patterns and tips |
| [Migration Guide](https://danteukraine.github.io/playwright-elements/docs/migration_guide.html) | Upgrade instructions |
| [FAQ](https://danteukraine.github.io/playwright-elements/docs/faq.html) | Common questions and solutions |

For version-specific changes and release notes, see the [CHANGELOG](https://github.com/DanteUkraine/playwright-elements/blob/main/CHANGELOG.md).

---

[![Stars](https://img.shields.io/github/stars/DanteUkraine/playwright-elements.svg?style=social&label=Star)](https://github.com/DanteUkraine/playwright-elements)
[![Forks](https://img.shields.io/github/forks/DanteUkraine/playwright-elements.svg?style=social&label=Fork)](https://github.com/DanteUkraine/playwright-elements)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
