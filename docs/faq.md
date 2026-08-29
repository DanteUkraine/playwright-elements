---
layout: default
title: Frequently Asked Questions
---
[Go to Main Page >>](./../README.md)

# Frequently Asked Questions

> **Common questions and answers about playwright-elements**

---

## General Questions

### Q: What is playwright-elements?

**A:** Playwright-elements is a TypeScript library that wraps Playwright's Locator API to provide:
- Type-safe page objects
- Chainable element hierarchies
- Reusable components
- Minimal boilerplate code
- Framework-agnostic architecture (since v1.18.3)

### Q: How is it different from using Playwright directly?

**A:** While you can use Playwright's native locators directly, playwright-elements offers:
- **Type safety**: Full TypeScript support with proper type inference for nested elements
- **Reusability**: Create reusable page object components
- **Cleaner syntax**: Chainable methods for building complex selectors
- **Less boilerplate**: Reduce repetitive code in tests
- **Framework flexibility**: Works with any test framework (not just @playwright/test)

### Q: What are the dependencies?

**A:** The library has minimal dependencies:
- **Required**: `playwright-core` (peer dependency)
- **Optional**: `@playwright/test` (only for test utilities and fixtures)
- **Optional**: `lodash.clonedeep` (for deep cloning)

The core WebElement class only depends on `playwright-core`, making it suitable for production use.

---

## Installation and Setup

### Q: How do I install playwright-elements?

**A:**
```bash
npm install -D playwright-elements
# or
pnpm add -D playwright-elements
# or
yarn add -D playwright-elements
```

### Q: Do I need to install Playwright separately?

**A:** Yes, you need to install Playwright as a peer dependency:
```bash
npm install -D playwright @playwright/test
```

### Q: How do I set up with Playwright Test?

**A:** Simple! Just import from playwright-elements:
```typescript
import { test, $ } from 'playwright-elements';

test('my test', async ({ goto }) => {
    await goto('/');
    await $('.button').click();
});
```

The library provides extended test fixtures that automatically configure everything.

### Q: How do I set up with Mocha?

**A:** 
1. Install required packages:
```bash
npm install -D mocha ts-node @types/mocha playwright-elements playwright @playwright/test
```

2. Create `test/mocha.setup.ts`:
```typescript
import { configureWebElementExpect } from 'playwright-elements';
configureWebElementExpect();
```

3. Update `.mocharc.json`:
```json
{
  "extension": ["ts"],
  "spec": "./**/*.spec.ts",
  "loader": "ts-node/esm",
  "require": ["./test/mocha.setup.ts"]
}
```

4. Write your tests:
```typescript
import { $, BrowserInstance } from 'playwright-elements';

describe('my tests', () => {
    before(async () => {
        await BrowserInstance.start();
    });

    it('should work', async () => {
        await $('.button').expect().toBeVisible();
    });
});
```

---

## Expect and Assertions

### Q: Why do I get "Assertion provider not configured" error?

**A:** This error occurs when you try to use `expect()` or `softExpect()` without configuring the assertion provider.

**Solutions:**

1. **For Playwright Test**: Import from playwright-elements (automatic configuration):
```typescript
import { test } from 'playwright-elements';
test('...', async () => {
    await $('.element').expect().toBeVisible(); // Works automatically
});
```

2. **For Mocha**: Call `configureWebElementExpect()` in setup:
```typescript
import { configureWebElementExpect } from 'playwright-elements';
configureWebElementExpect();
```

3. **For custom frameworks**: Configure provider manually:
```typescript
import { WebElement } from 'playwright-elements';
WebElement.setExpectProvider({ expect, softExpect: expect.soft });
```

### Q: What is the ExpectProvider pattern?

**A:** The ExpectProvider pattern (introduced in v1.18.3) is an architectural change that decouples WebElement from test frameworks. Instead of directly importing and using `@playwright/test`'s expect, WebElement now receives its assertion functionality through a provider interface.

**Benefits:**
- Framework-agnostic: Works with any test framework
- Production-ready: Core code has no test dependencies
- Customizable: Easy to inject custom assertion libraries
- Testable: Easy to mock in unit tests

### Q: Can I use custom matchers with playwright-elements?

**A:** Yes! With the new provider pattern, you can configure custom matchers:

```typescript
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

const customExpect = expect.extend({
    async toHaveCustomValue(locator, expected) {
        const actual = await locator.getAttribute('data-custom');
        return {
            pass: actual === expected,
            message: () => `Expected custom value to be ${expected}, but got ${actual}`
        };
    }
});

WebElement.setExpectProvider({
    expect: customExpect,
    softExpect: customExpect.soft
});

// Now use custom matcher
await $('.element').expect().toHaveCustomValue('test');
```

### Q: What's the difference between `expect()` and `softExpect()`?

**A:** 
- `expect()`: Standard assertion that fails immediately if the condition is not met
- `softExpect()`: Soft assertion that collects failures and reports them at the end of the test

**Example:**
```typescript
// Standard expect - fails immediately
await $('.name').expect().toHaveValue('John'); // Test fails here if wrong

// Soft expect - collects failures
await $('.name').softExpect().toHaveValue('John');  // Failure collected
await $('.email').softExpect().toHaveValue('test@example.com'); // Failure collected
// Test fails at the end with all collected failures
```

### Q: Why doesn't autocompletion work for custom matchers?

**A:** Autocompletion for custom matchers depends on:
1. Proper TypeScript type definitions
2. Using the provider pattern correctly

To get autocompletion:
- Configure the provider with your extended expect
- Use type annotations for better type safety
- Consider creating custom WebElement subclasses with typed expect methods

---

## Page Objects and Elements

### Q: How do I create a page object?

**A:**
```typescript
import { $, WebElement } from 'playwright-elements';

export class LoginPage {
    readonly form = $('.login-form').with({
        username: $('#username'),
        password: $('#password'),
        submitButton: $('#submit')
    });
}

// Usage
const loginPage = new LoginPage();
await loginPage.form.username.fill('user');
await loginPage.form.password.fill('pass');
await loginPage.form.submitButton.click();
```

### Q: How do I create reusable components?

**A:**
```typescript
// header.component.ts
import { $, WebElement } from 'playwright-elements';

export const header = $('.header').with({
    logo: $('.logo'),
    navigation: $('.nav').with({
        homeLink: $('[href="/"]'),
        aboutLink: $('[href="/about"]')
    })
});

// Usage in page objects
export class HomePage {
    readonly header = header;
}

const page = new HomePage();
await page.header.logo.click();
```

### Q: How do I add custom methods to elements?

**A:**
```typescript
import { $, WebElement } from 'playwright-elements';

class EnhancedInput extends WebElement {
    async typeSlowly(text: string, delay: number = 50) {
        await this.fill('');
        await this.type(text, { delay });
    }
}

const input = new EnhancedInput('#username');
await input.typeSlowly('test user');
```

### Q: How do I access parent elements?

**A:** Use the `parent()` method with type annotations:

```typescript
import { $, WebElement } from 'playwright-elements';

const header = $('.header').with({
    logo: $('.logo'),
    menu: $('.menu')
});

// Access parent with type safety
const parent = header.logo.parent<{ menu: WebElement }>();
// parent is now typed as WebElement & { menu: WebElement }
```

---

## Browser and Context Management

### Q: How do I manage browser instances?

**A:** Use `BrowserInstance` singleton:

```typescript
import { BrowserInstance, BrowserName } from 'playwright-elements';

// Start browser
await BrowserInstance.start(BrowserName.CHROMIUM);

// Start context
await BrowserInstance.startNewContext();

// Start page
await BrowserInstance.startNewPage();

// Access current instances
const browser = BrowserInstance.browser;
const context = BrowserInstance.currentContext;
const page = BrowserInstance.currentPage;

// Close everything
await BrowserInstance.close();
```

### Q: How do I switch between tabs?

**A:**
```typescript
import { BrowserInstance } from 'playwright-elements';

// Open a new tab
await BrowserInstance.startNewPage();
await BrowserInstance.currentPage.goto('https://example.com');

// Switch to previous tab
await BrowserInstance.switchToPreviousTab();

// Switch to tab by index
await BrowserInstance.switchToTabByIndex(0);
```

### Q: How do I detect mobile context?

**A:**
```typescript
import { BrowserInstance } from 'playwright-elements';

if (BrowserInstance.isContextMobile) {
    // Running on mobile
} else {
    // Running on desktop
}
```

---

## Troubleshooting

### Q: My tests fail with "Assertion provider not configured"

**A:** See [Why do I get "Assertion provider not configured" error?](#q-why-do-i-get-assertion-provider-not-configured-error)

### Q: Tests work locally but fail in CI

**A:** Common causes:
1. **Missing setup file in CI config**: Ensure your `.mocharc.json` includes the setup file
2. **Different Node version**: Ensure CI uses the same Node version as local
3. **Missing dependencies**: Run `npm ci` in CI to install exact dependencies
4. **Environment variables**: Check if CI has required environment variables

**Solution:**
```json
// .mocharc.json
{
  "require": ["./test/mocha.setup.ts"]
}
```

### Q: TypeScript compilation errors

**A:** Common issues:
1. **Missing types**: Install `@types/node` for Node.js types
2. **Version mismatch**: Ensure Playwright versions match between dependencies
3. **tsconfig.json**: Check your TypeScript configuration

**Solution:**
```bash
npm install -D @types/node
```

### Q: Locator not found errors

**A:** Common causes:
1. **Wrong selector**: Verify your CSS/selector syntax
2. **Timing issue**: Element not visible/ready when accessed
3. **Iframe context**: Element might be inside an iframe

**Solutions:**
```typescript
// Wait for element
await $('.element').waitFor();

// Check if element exists
const count = await $('.element').count();

// For iframes
const iframe = $('#iframe').contentFrame();
const element = iframe.$('.inside-iframe');
```

---

## Best Practices

### Q: Should I use page objects or component-driven style?

**A:** Both approaches work well. Choose based on your needs:

**Page Objects** (Recommended for large applications):
```typescript
// pages/login.page.ts
export class LoginPage {
    readonly form = $('.form').with({ /* ... */ });
}

// tests/login.test.ts
const page = new LoginPage();
await page.form.username.fill('user');
```

**Component-Driven** (Recommended for smaller applications):
```typescript
// elements.ts
export const loginForm = $('.form').with({ /* ... */ });

// tests/login.test.ts
import * as elements from './elements';
await elements.loginForm.username.fill('user');
```

### Q: How should I organize my page objects?

**A:** Recommended structure:
```
project/
├── src/
│   └── page-objects/
│       ├── components/       # Reusable components
│       │   ├── header.ts
│       │   ├── footer.ts
│       │   └── ...
│       ├── pages/           # Page objects
│       │   ├── login.page.ts
│       │   ├── home.page.ts
│       │   └── ...
│       └── index.ts         # Exports all page objects
└── tests/
    └── ...
```

### Q: Should I use `expect()` or `softExpect()`?

**A:** Use case guidelines:

| Use Case | Recommended Method |
|----------|-------------------|
| Single assertion | `expect()` |
| Multiple independent checks | `softExpect()` |
| Critical path validation | `expect()` |
| Exploratory checks | `softExpect()` |
| Form validation (multiple fields) | `softExpect()` |

**Example:**
```typescript
// Single critical check
await $('.save-button').expect().toBeEnabled();

// Multiple form field validations
await $('.name').softExpect().toHaveValue('John');
await $('.email').softExpect().toHaveValue('john@example.com');
await $('.age').softExpect().toHaveValue('30');
// All three are checked, test fails if any fail
```

---

## Performance

### Q: Does playwright-elements add performance overhead?

**A:** Minimal overhead:
- Locators are built lazily (only when needed)
- Built locators are cached
- No Proxy objects used
- Thin wrapper over Playwright's native Locator

**Performance tips:**
- Use `waitFor()` before interacting with elements
- Chain selectors efficiently
- Avoid excessive nesting

### Q: How do I optimize slow tests?

**A:**
1. **Parallelize tests**: Use Playwright's parallel test execution
2. **Reuse page instances**: Configure proper fixture scope
3. **Avoid unnecessary waits**: Use appropriate wait strategies
4. **Use efficient selectors**: Prefer `getByTestId` over complex CSS
5. **Profile tests**: Use Playwright's trace viewer to identify bottlenecks

---

## Advanced Topics

### Q: Can I use playwright-elements in production code?

**A:** Yes! The core WebElement class (since v1.18.3) has no dependency on test frameworks:

```typescript
// production.code.ts
import { WebElement } from 'playwright-elements';

// This works without @playwright/test
const element = new WebElement('#my-element');
// element.locator is available but expect() requires provider
```

**Note:** Without configuring an ExpectProvider, `expect()` and `softExpect()` will throw errors. Use the locator directly for production code:

```typescript
const element = new WebElement('#my-element');
const locator = element.locator;
// Use locator methods directly
```

### Q: How do I extend WebElement with custom functionality?

**A:** See [How do I add custom methods to elements?](#q-how-do-i-add-custom-methods-to-elements)

### Q: Can I use playwright-elements with other testing libraries?

**A:** Yes! The library is framework-agnostic (since v1.18.3). You can use it with:
- Jest
- Mocha
- Vitest
- Custom test frameworks

Just configure the ExpectProvider with your framework's expect:

```typescript
import { WebElement } from 'playwright-elements';
import { myExpect, mySoftExpect } from 'my-test-framework';

WebElement.setExpectProvider({
    expect: myExpect,
    softExpect: mySoftExpect
});
```

---

## Support and Contributions

### Q: Where can I get help?

**A:**
- GitHub Issues: https://github.com/DanteUkraine/playwright-elements/issues
- GitHub Discussions: https://github.com/DanteUkraine/playwright-elements/discussions
- Documentation: https://github.com/DanteUkraine/playwright-elements/tree/main/docs

### Q: How can I contribute?

**A:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Q: How do I report bugs?

**A:**
1. Check existing issues to avoid duplicates
2. Create a minimal reproduction
3. Include:
   - Version of playwright-elements
   - Version of Playwright
   - Version of Node.js
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Code example

---

[Go to Main Page >>](./../README.md)
