---
layout: default
title: FAQ
---
[Go to Main Page >>](./../README.md)

# Frequently Asked Questions

Common questions about playwright-elements, its features, and usage patterns.

- [General Questions](#general-questions)
- [Type System Questions](#type-system-questions)
- [Selector Questions](#selector-questions)
- [Testing Questions](#testing-questions)
- [Integration Questions](#integration-questions)
- [Performance Questions](#performance-questions)
- [Migration Questions](#migration-questions)
- [Contributing Questions](#contributing-questions)

---

## General Questions

### What is playwright-elements?

**playwright-elements** is a TypeScript wrapper for Playwright that provides a **component-based**, **type-safe** approach to writing end-to-end tests. It enables you to create reusable page objects and components with minimal boilerplate while maintaining full compatibility with Playwright's API.

### How does it compare to pure Playwright?

| Feature | playwright-elements | Pure Playwright |
|---------|---------------------|-----------------|
| Type Safety | Excellent (automatic) | Manual (requires type assertions) |
| Page Objects | Built-in, type-safe | Manual setup |
| Component Model | Yes, with nesting | No |
| Chainable Selectors | Yes | Limited |
| Boilerplate | Minimal | Moderate to high |
| Learning Curve | Medium | Low |
| Playwright Features | Full access | Full access |

### Why should I use playwright-elements instead of pure Playwright?

**playwright-elements offers several advantages:**

1. **70%+ reduction in boilerplate** - Less repetitive code
2. **Type-safe page objects** - Catch errors at compile time
3. **Nested component hierarchy** - Natural representation of DOM structure
4. **Custom methods with proper `this` context** - Add domain-specific logic
5. **Reusable components** - Define once, use everywhere
6. **Better maintainability** - Easier to understand and modify

### Does playwright-elements work with all Playwright features?

**Yes!** playwright-elements is a thin wrapper around Playwright's Locator API. You have full access to all Playwright features through the `_` property or directly on WebElement instances.

```typescript
import { $ } from 'playwright-elements';

const element = $('button');

// All Playwright Locator methods are available
await element.click();
await element.fill('text');
await element.hover();
await element.screenshot();

// Access the underlying Locator directly
await element._.click();
await element.locator.click();
```

### Is playwright-elements production-ready?

**Yes!** playwright-elements is used in production by many teams. It has:
- 344+ tests across 9 CI jobs
- Full test coverage
- Actively maintained and updated
- Regular releases with new features and bug fixes
- Performance benchmarks confirming minimal overhead

---

## Type System Questions

### How does the type system work?

playwright-elements uses advanced TypeScript generics to provide type safety:

- **`NestedElements<T, A>`** - Recursively processes augmentation objects for type-safe nested elements
- **`InternalMethods<T, M>`** - Handles type-safe addition of custom methods
- **`InferNestedElements<T>`** - Extracts nested element configurations

See the [Type System Deep Dive](type_system.md) for complete details.

### Why does `this` work correctly in custom methods?

The type system automatically rebinds `this` to include all properties defined in the `with()` call:

```typescript
const form = $('.form').with({
  username: $('input'),
  
  async login() {
    // `this` is automatically typed as:
    // WebElement & { username: WebElement, login: () => Promise<void> }
    await this.username.fill('user');  // ✅ Type-safe
  }
});
```

This is achieved through conditional type inference in the `NestedElements` type.

### Can I add properties after creating an element?

**Yes, but with limitations:**

```typescript
// Method 1: Add through additional with() call (recommended)
const form = $('.form').with({
  username: $('input')
}).with({
  login: async function() {
    await this.username.fill('user');
  }
});

// Method 2: Direct assignment (this will be any)
const form = $('.form').with({
  username: $('input')
});
form.login = async function() {
  // ❌ this is any, username access not type-safe
  await this.username.fill('user');
};

// Method 3: Type assertion (not recommended)
const form = $('.form') as WebElement & {
  username: WebElement;
  login: () => Promise<void>;
};
```

**Recommendation:** Use multiple `with()` calls to maintain type safety.

### How do I define reusable component types?

Create factory functions or extend WebElement:

```typescript
// Option 1: Factory function
function createButton(selector: string) {
  return $(selector).with({
    icon: $(`.icon`, selector),
    label: $(`.label`, selector),
    
    async clickWithRetry(times: number = 3) {
      for (let i = 0; i < times; i++) {
        try {
          await this.click();
          return;
        } catch (e) {
          if (i === times - 1) throw e;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  });
}

const submitButton = createButton('button.submit');

// Option 2: Extend WebElement
class Button extends WebElement {
  readonly icon = this.$('.icon');
  readonly label = this.$('.label');
  
  async clickWithRetry(times: number = 3) {
    // Implementation
  }
}

const button = new Button('button.submit');
```

### How do I handle circular references in types?

TypeScript has limitations with circular type references. For most use cases, the type system handles this gracefully:

```typescript
// This works fine
const parent = $('.parent').with({
  child: $('.child').with({
    // Reference back to parent is possible through selector chains
    parentLink: $('a[href="#parent"]')
  })
});
```

For true circular type dependencies, you may need to use type assertions or interfaces.

---

## Selector Questions

### What selector methods are available?

All standard CSS selectors plus Playwright's `getBy*` methods:

```typescript
import { $, $getByAltText, $getByLabel, $getByPlaceholder, 
         $getByRole, $getByTestId, $getByText, $getByTitle } from 'playwright-elements';

// CSS selector
const element = $('div.container');

// getBy methods (recommended for accessibility)
const button = $getByRole('button', { name: 'Submit' });
const input = $getByLabel('Email');
const icon = $getByTestId('user-icon');
const image = $getByAltText('Logo');
const field = $getByPlaceholder('Enter your name');
const link = $getByText('Click here');
const page = $getByTitle('Home Page');
```

### How do I create complex selectors?

Use chainable methods to build complex selectors:

```typescript
const element = $('div')
  .hasText('Container')           // Has text
  .has($('span').hasText('Icon')) // Contains specific child
  .hasNot($('.disabled'))         // Doesn't contain
  .nth(0)                        // First matching element
  .and($('div.visible'))          // AND condition
  .or($('div.alternative'))      // OR condition
  ;

// Resulting selector is optimized automatically
```

### How do I select elements within iframes?

Use `contentFrame()` to work with iframe content:

```typescript
// Select the iframe
const iframe = $('iframe#my-iframe').contentFrame();

// Select elements within the iframe
const button = iframe.$('button.submit');
const input = iframe.$('input[name="username"]');

// Nested iframes are also supported
const nestedIframe = iframe.$('iframe#nested').contentFrame();
const element = nestedIframe.$('.element');
```

### How do I work with multiple tabs?

Use the `BrowserInstance` API for tab management:

```typescript
import { BrowserInstance } from 'playwright-elements';

// Get current tab
const currentPage = BrowserInstance.currentPage;

// Open new tab
const newTab = await BrowserInstance.openNewTab();

// Switch to specific tab
await BrowserInstance.switchToTabByIndex(1);

// Switch back to previous tab
await BrowserInstance.switchToPreviousTab();

// Get all tabs
const allTabs = BrowserInstance.pages;
```

### How do I select parent elements?

Use the `parent()` method or build selector chains:

```typescript
const child = $('.child');
const parent = child.parent();

// With type safety
const form = $('.form').with({
  username: $('input[name="username"]')
});
const parentOfUsername = form.username.parent();
// parentOfUsername has type: WebElement & typeof form
```

---

## Testing Questions

### How do I write tests with playwright-elements?

Use the provided test fixtures:

```typescript
import { test, expect, $ } from 'playwright-elements';

test('login test', async () => {
  // Navigate to page
  await BrowserInstance.currentPage.goto('https://example.com/login');
  
  // Define elements
  const username = $('input[name="username"]');
  const password = $('input[name="password"]');
  const submit = $('button[type="submit"]');
  
  // Perform actions
  await username.fill('myuser');
  await password.fill('mypassword');
  await submit.click();
  
  // Assertions
  await $('.welcome-message').expect().toBeVisible();
});
```

### How do I use page objects?

Create reusable page object classes:

```typescript
// login.page.ts
export class LoginPage {
  readonly username = $('input[name="username"]');
  readonly password = $('input[name="password"]');
  readonly submit = $('button[type="submit"]');
  readonly error = $('.error-message');
  
  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
  
  async expectError(message: string) {
    await this.error.expect().toHaveText(message);
  }
}

// test/login.test.ts
import { test } from 'playwright-elements';
import { LoginPage } from '../pages/login.page';

test('login with invalid credentials', async () => {
  const loginPage = new LoginPage();
  await loginPage.login('wrong', 'wrong');
  await loginPage.expectError('Invalid credentials');
});
```

Or use the `buildPageObject` utility:

```typescript
import { buildPageObject } from 'playwright-elements';

class LoginPage {
  username = $('input[name="username"]');
  password = $('input[name="password"]');
  submit = $('button[type="submit"]');
}

class HomePage {
  welcome = $('.welcome-message');
}

const pages = buildPageObject({
  LoginPage,
  HomePage
});

// Usage in tests
pages.loginPage.username.fill('user');
```

### How do I use assertions?

playwright-elements provides both `expect()` and `softExpect()`:

```typescript
// Hard assertion - fails test immediately
const element = $('.element');
await element.expect().toBeVisible();
await element.expect().toHaveText('Expected text');
await element.expect().toContainText('partial text');
await element.expect().toHaveValue('value');
await element.expect().toBeChecked();
await element.expect().toBeEnabled();

// Soft assertion - continues after failure, collected at end
const result = await element.softExpect().toBeVisible();

// All Playwright expect methods are available
import { expect } from 'playwright-elements';
await expect(element.locator).toHaveAttribute('disabled');
```

### How do I wait for elements?

Use the `waitFor()` method:

```typescript
// Wait for visibility
await $('.element').waitFor({ state: 'visible' });

// Wait for hidden
await $('.element').waitFor({ state: 'hidden' });

// Wait for attached (in DOM)
await $('.element').waitFor({ state: 'attached' });

// Wait for detached (removed from DOM)
await $('.element').waitFor({ state: 'detached' });

// Custom timeout
await $('.element').waitFor({ state: 'visible', timeout: 10000 });
```

### How do I handle lists of elements?

Use the array methods or `getAll()`:

```typescript
const items = $('.item');

// Get all matching elements
const allItems = await items.getAll();

// Iterate async
await items.asyncForEach(async (item) => {
  await item.click();
});

// Iterate sync (sequential)
await items.syncForEach(async (item) => {
  await item.click();
});

// Map to values
const texts = await items.map(async (item) => {
  return await item.textContent();
});

// Filter elements
const visibleItems = await items.filterElements(async (item) => {
  return await item.isVisible();
});

// Filter by criteria
const filtered = items.filter({
  hasText: 'Specific',
  hasNot: $('.disabled')
});

// Select by index
const first = items.first();
const last = items.last();
const second = items.nth(1);
```

---

## Integration Questions

### Can I use playwright-elements with Mocha/Chai?

**Yes!** playwright-elements works with any test runner:

```typescript
import { expect } from 'chai';
import { $, BrowserInstance } from 'playwright-elements';

describe('My test suite', () => {
  before(async () => {
    await BrowserInstance.init();
    await BrowserInstance.currentPage.goto('https://example.com');
  });
  
  it('should test something', async () => {
    const element = $('button');
    await element.click();
    expect(await element.count()).to.equal(1);
  });
  
  after(async () => {
    await BrowserInstance.close();
  });
});
```

### Can I use playwright-elements with Jest?

**Yes:**

```typescript
import { $, BrowserInstance } from 'playwright-elements';

beforeAll(async () => {
  await BrowserInstance.init();
});

afterAll(async () => {
  await BrowserInstance.close();
});

test('Jest test', async () => {
  const element = $('button');
  await element.click();
});
```

### Can I use playwright-elements with Cucumber?

**Yes:**

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { $, BrowserInstance } from 'playwright-elements';

Given('I am on the login page', async () => {
  await BrowserInstance.currentPage.goto('https://example.com/login');
});

When('I fill in username {string}', async (username) => {
  await $('input[name="username"]').fill(username);
});

Then('I should see the welcome message', async () => {
  await $('.welcome-message').expect().toBeVisible();
});
```

### How do I integrate with existing Playwright tests?

Gradually migrate by importing playwright-elements alongside Playwright:

```typescript
import { test, expect } from '@playwright/test';
import { $, BrowserInstance, usePage } from 'playwright-elements';

test('mixed test', async ({ page }) => {
  // Use playwright-elements
  await usePage(page);
  
  // playwright-elements selectors
  const button = $('button');
  await button.click();
  
  // Raw Playwright
  await page.locator('div').click();
  
  // Both can coexist
  const element = $('input');
  await expect(element.locator).toBeVisible();
});
```

---

## Performance Questions

### How fast is playwright-elements?

Based on benchmarks:

| Operation | Time |
|-----------|------|
| Build 100+ page objects | < 500ms |
| Create 1000 WebElement instances | < 100ms |
| 1000 concurrent element operations | < 2000ms |
| 5-level nested selector chains | < 10ms |
| Full test suite (344 tests, 9 jobs) | ~45 seconds |

**Conclusion:** playwright-elements adds minimal overhead (<1%) compared to raw Playwright.

### How can I optimize my tests?

**Best practices for performance:**

1. **Reuse element references:**
   ```typescript
   // ❌ Creates element each time
   async function clickButton() {
     await $('.button').click();
   }
   
   // ✅ Reuse element
   const button = $('.button');
   async function clickButton() {
     await button.click();
   }
   ```

2. **Avoid unnecessary waits:**
   ```typescript
   // ❌ Unnecessary wait
   await new Promise(resolve => setTimeout(resolve, 5000));
   
   // ✅ Wait for specific condition
   await $('.element').waitFor({ state: 'visible' });
   ```

3. **Use `asyncForEach` for parallel operations:**
   ```typescript
   const items = $$('.item');
   
   // ✅ Parallel operations
   await items.asyncForEach(async (item) => {
     await item.click();
   });
   
   // ❌ Sequential operations (slower)
   const allItems = await items.getAll();
   for (const item of allItems) {
     await item.click();
   }
   ```

4. **Run tests in parallel:**
   ```bash
   npm test -- --parallel
   ```

5. **Use proper selectors:**
   ```typescript
   // ❌ Slow: complex CSS selector
   const element = $('div > ul > li:nth-child(2) > a');
   
   // ✅ Fast: direct selector
   const element = $getByTestId('link-2');
   ```

### How much memory does playwright-elements use?

**Memory benchmarks:**
- 100 page object creations: < 10MB
- 1000 WebElement instances: < 5MB
- Full test suite: < 500MB peak

**Memory optimization tips:**
1. Clean up between tests:
   ```typescript
   afterEach(async () => {
     await BrowserInstance.clearContext();
   });
   ```

2. Limit concurrent workers:
   ```bash
   npm test -- --workers 4
   ```

3. Use proper test isolation

---

## Migration Questions

### How do I migrate from pure Playwright to playwright-elements?

**Step-by-step migration:**

1. **Install playwright-elements:**
   ```bash
   npm install -D playwright-elements
   ```

2. **Start with selector replacement:**
   ```typescript
   // Before
   await page.locator('button').click();
   
   // After
   import { $, usePage } from 'playwright-elements';
   await usePage(page);
   await $('button').click();
   ```

3. **Create reusable components:**
   ```typescript
   // Before
   const username = page.locator('input[name="username"]');
   const password = page.locator('input[name="password"]');
   const submit = page.locator('button[type="submit"]');
   
   // After
   const form = $('.form').with({
     username: $('input[name="username"]'),
     password: $('input[name="password"]'),
     submit: $('button[type="submit"]')
   });
   ```

4. **Add custom methods:**
   ```typescript
   const form = $('.form').with({
     username: $('input[name="username"]'),
     password: $('input[name="password"]'),
     submit: $('button[type="submit"]'),
     
     async login(user: string, pass: string) {
       await this.username.fill(user);
       await this.password.fill(pass);
       await this.submit.click();
     }
   });
   ```

5. **Update assertions:**
   ```typescript
   // Before
   await expect(page.locator('.message')).toBeVisible();
   
   // After
   await $('.message').expect().toBeVisible();
   ```

### Can I use both Playwright and playwright-elements in the same project?

**Yes!** They can coexist:

```typescript
import { test, expect } from '@playwright/test';
import { $, usePage } from 'playwright-elements';

test('mixed usage', async ({ page }) => {
  await usePage(page);
  
  // playwright-elements
  const element = $('button');
  await element.click();
  
  // Raw Playwright
  const locator = page.locator('div');
  await expect(locator).toBeVisible();
  
  // Access underlying Locator
  const playwrightLocator = element.locator;
  await expect(playwrightLocator).toBeVisible();
});
```

### How do I migrate from other testing frameworks (Cypress, WebdriverIO)?

**General approach:**

1. **Replace selectors:**
   ```typescript
   // Cypress
   cy.get('button').click();
   
   // playwright-elements
   await $('button').click();
   ```

2. **Replace page objects:**
   ```typescript
   // WebdriverIO
   class LoginPage {
     get username() { return $('#username'); }
     async login(user, pass) {
       await this.username.setValue(user);
     }
   }
   
   // playwright-elements
   const loginPage = $('.login-form').with({
     username: $('#username'),
     async login(user, pass) {
       await this.username.fill(user);
     }
   });
   ```

3. **Replace assertions:**
   ```typescript
   // Cypress
   cy.get('.message').should('be.visible');
   
   // playwright-elements
   await $('.message').expect().toBeVisible();
   ```

**Note:** Some framework-specific features may require different approaches.

---

## Contributing Questions

### How can I contribute to playwright-elements?

See the [CONTRIBUTING.md](../CONTRIBUTING.md) file for detailed contribution guidelines.

**Quick start:**

1. Fork the repository
2. Clone your fork
3. Install dependencies:
   ```bash
   npm install
   npm run install:deps
   npm run install:browsers
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Run tests:
   ```bash
   npm test
   ```

### How do I report a bug?

1. **Check existing issues:** [GitHub Issues](https://github.com/DanteUkraine/playwright-elements/issues)
2. **Create a minimal reproduction:**
   ```typescript
   // Minimal code that reproduces the issue
   import { test, $ } from 'playwright-elements';
   
   test('reproduce bug', async () => {
     // Your code here
   });
   ```
3. **Open a new issue:** [New Issue](https://github.com/DanteUkraine/playwright-elements/issues/new)

**Include:**
- Node.js version
- TypeScript version
- Playwright version
- playwright-elements version
- Operating system
- Minimal reproduction code
- Error message and stack trace
- Steps to reproduce

### How do I suggest a new feature?

1. **Check existing feature requests:** [GitHub Issues](https://github.com/DanteUkraine/playwright-elements/issues?q=is%3Aissue+is%3Aopen+label%3Afeature-request)
2. **Open a new feature request:** [New Issue](https://github.com/DanteUkraine/playwright-elements/issues/new)
3. **Provide:**
   - Clear description of the feature
   - Use cases and examples
   - Potential API design
   - Benefits to users

### How do I run tests locally?

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test:single test/your-test.ts

# Run integration tests
npm run integration:test
```

### How do I build the project?

```bash
# Build TypeScript source
npm run build

# Clean build
npm run clean

# Lint code
npm run lint
```

### How do I generate documentation?

The documentation is written manually in markdown files. You can:

1. **Update existing docs:** Edit files in the `docs/` directory
2. **Add new docs:** Create new markdown files in `docs/`
3. **Update README:** Edit `README.md` with new features

All documentation follows the same format with:
- Title and layout frontmatter
- Table of contents at the top
- Clear section headings
- Code examples
- Cross-references to related docs

---

## Additional Resources

- [GitHub Repository](https://github.com/DanteUkraine/playwright-elements)
- [npm Package](https://www.npmjs.com/package/playwright-elements)
- [Changelog](../CHANGELOG.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Type System Documentation](type_system.md)
- [Troubleshooting Guide](troubleshooting.md)

---

## Still have questions?

If your question isn't answered here:

1. **Check the troubleshooting guide:** [troubleshooting.md](troubleshooting.md)
2. **Search existing issues:** [GitHub Issues](https://github.com/DanteUkraine/playwright-elements/issues)
3. **Ask in discussions:** [GitHub Discussions](https://github.com/DanteUkraine/playwright-elements/discussions)
4. **Open a new issue:** [New Issue](https://github.com/DanteUkraine/playwright-elements/issues/new)
