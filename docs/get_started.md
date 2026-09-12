[Go to Main Page >>](./../README.md)

# Get Started with Playwright-elements

> **Build maintainable, type-safe end-to-end tests with Playwright**

Playwright-elements is a powerful TypeScript framework that extends Playwright with enterprise-grade testing capabilities. Whether you're building a small project or a large-scale application, this guide will help you get started quickly.

---

## Who Is This For?

Playwright-elements is designed for:

| Role | Benefit |
|------|---------|
| **QA Engineers** | Write maintainable tests with reusable components |
| **Frontend Developers** | Test React/Vue/Angular apps with component-driven testing |
| **Test Automation Engineers** | Build scalable test suites with clean architecture |
| **Technical Leads** | Enforce type safety and best practices across the team |

**You should use playwright-elements if:**
- You want **reusable, maintainable** test code
- You need **type safety** to prevent selector typos
- Your application has **many reusable UI components**
- You want to follow **Page Object Pattern** or **Component-Driven Testing**
- You're migrating from **Selenium** or other frameworks

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** 18+ installed
2. **npm** or **yarn** package manager
3. Basic knowledge of **TypeScript**
4. Familiarity with **Playwright** basics (recommended but not required)

If you're new to Playwright, we recommend completing the [Playwright Getting Started](https://playwright.dev/docs/intro) first.

---

## Installation

### 1. Install Playwright (if not already installed)

```bash
npm init playwright@latest
```

This will create a new Playwright project with the basic configuration.

### 2. Install playwright-elements

```bash
npm install -D playwright-elements
```

---

## Your First Test

Let's create a simple test to understand the core concepts.

### Step 1: Create a Page Object

Create a new file `pages/login.page.ts`:

```typescript
// pages/login.page.ts
import { $ } from 'playwright-elements';

export class LoginPage {
  // Define elements using CSS selectors
  readonly usernameField = $('input[name="username"]');
  readonly passwordField = $('input[name="password"]');
  readonly submitButton = $('button[type="submit"]');
  readonly errorMessage = $('.error-message');

  // Add custom methods for reusable actions
  async login(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

**What's happening here?**
- `$()` is a shortcut for creating a `WebElement`
- `WebElement` wraps Playwright's `Locator` with additional features
- Each element is **type-safe** and supports autocompletion
- You can add **custom methods** to encapsulate complex interactions

### Step 2: Create a Test

Create a new test file `tests/login.spec.ts`:

```typescript
// tests/login.spec.ts
import { test } from 'playwright-elements';
import { LoginPage } from '../pages/login.page';

test.describe('Login Page', () => {
  test('should login successfully with valid credentials', async ({ goto }) => {
    // Navigate to your login page
    await goto('/login');

    // Create page object instance
    const loginPage = new LoginPage();

    // Use the custom method
    await loginPage.login('admin', 'password123');

    // Make assertions
    await loginPage.errorMessage.expect().toBeHidden();
  });

  test('should show error with invalid credentials', async ({ goto }) => {
    await goto('/login');

    const loginPage = new LoginPage();
    await loginPage.login('admin', 'wrongpassword');

    // Assert error message is visible
    await loginPage.errorMessage.expect().toBeVisible();
    await loginPage.errorMessage.expect().toContainText('Invalid credentials');
  });
});
```

**Key points:**
- Use `test` from `'playwright-elements'` to get enhanced fixtures
- `goto` fixture is provided for navigation
- `.expect()` provides access to Playwright's assertion library
- All assertions are **automatically configured** (no setup needed)

### Step 3: Run Your Test

```bash
npx playwright test
```

---

## Core Concepts Explained

### WebElement

`WebElement` is the foundation of playwright-elements. It's a wrapper around Playwright's `Locator` that provides:

- **Type-safe selectors** - Prevent typos and get autocompletion
- **Sub-element support** - Build hierarchical component structures
- **Custom methods** - Add reusable actions with proper `this` typing
- **Assertion support** - Access Playwright's expect API

```typescript
// Simple element
const button = $('button.submit');

// With sub-elements
const form = $('.login-form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
});

// Access sub-elements with full type safety
await form.username.fill('admin');
await form.submit.click();
```

### The `with()` Method

The most powerful feature of playwright-elements is the ability to create **nested component structures** that mirror your application's DOM.

```typescript
// Multi-level hierarchy
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

// Usage: Chain through the hierarchy
await app.header.navigation.items.first().click();
```

**Benefits:**
- **Readable** - Code mirrors your application structure
- **Type-safe** - Full autocompletion for all nested elements
- **Reusable** - Define once, use everywhere
- **Maintainable** - Changes in one place propagate throughout

### Type-Safe Test IDs (v1.19.0+)

For even better type safety, use the Test IDs module:

```typescript
// testIds.ts
import { factory, sid } from 'playwright-elements';

export const ids = {
  login: {
    username: sid<'login.username'>('username-input'),
    password: sid<'login.password'>('password-input'),
    submit: sid<'login.submit'>('submit-button'),
  },
  button: factory<'button'>('btn')
} as const;

// Use in components (React example)
import { testIdProps } from 'playwright-elements';
import { ids } from './testIds';

function LoginForm() {
  return (
    <form>
      <input {...testIdProps(ids.login.username)} type="text" />
      <input {...testIdProps(ids.login.password)} type="password" />
      <button {...testIdProps(ids.login.submit)} type="submit">Login</button>
    </form>
  );
}

// Use in tests
import { $byTestId } from 'playwright-elements';

const usernameField = $byTestId(ids.login.username);
await usernameField.fill('admin');
```

**Benefits:**
- **Compile-time type checking** - Prevent selector typos
- **Autocompletion** - IDE suggests available IDs
- **Refactoring support** - Change IDs in one place
- **Zero runtime overhead** - All types are erased at compile time

---

## Project Structure Recommendations

Here's a recommended project structure for medium to large projects:

```
project/
├── src/
│   └── app/                    # Your application code
│
├── test/
│   ├── fixtures/               # Custom test fixtures
│   │   └── index.ts            # Main fixtures file
│   │
│   ├── pages/                  # Page objects
│   │   ├── login.page.ts       # Login page
│   │   ├── dashboard.page.ts    # Dashboard page
│   │   └── index.ts            # Auto-generated index
│   │
│   ├── components/             # Reusable components
│   │   ├── header.component.ts
│   │   ├── form.component.ts
│   │   └── index.ts
│   │
│   ├── testIds/                # Test ID definitions
│   │   └── index.ts
│   │
│   ├── utils/                  # Test utilities
│   │   └── helpers.ts
│   │
│   └── specs/                  # Test files
│       ├── login.spec.ts
│       ├── dashboard.spec.ts
│       └── api.spec.ts
│
├── playwright.config.ts        # Playwright configuration
└── package.json
```

### Setting Up Fixtures

Create a central fixtures file:

```typescript
// test/fixtures/index.ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import * as pageObjectModule from '../pages';

type TestFixtures = {
  pageObject: PageObject<typeof pageObjectModule>;
};

export const test = baseTest.extend<TestFixtures>({
  pageObject: [
    async ({}, use) => {
      await use(buildPageObject(pageObjectModule));
    },
    { scope: 'test' }
  ],
});

// Re-export everything you need
export * from 'playwright-elements';
```

Now you can use page objects with full autocompletion in your tests:

```typescript
// tests/dashboard.spec.ts
import { test } from '../fixtures';

test('dashboard navigation', async ({ pageObject }) => {
  // Full autocompletion for all pages
  await pageObject.login.login('admin', 'password');
  await pageObject.dashboard.navigateTo('settings');
});
```

---

## Next Steps

Now that you have the basics, explore these topics:

| Topic | Description | Time |
|-------|-------------|------|
| **[WebElement Deep Dive](./web_element.html)** | Master all WebElement features and methods | 30 min |
| **[Test IDs Module](./test_ids.html)** | Learn the type-safe test ID system | 20 min |
| **[Page Object Pattern](./build_page_object.html)** | Build scalable page objects | 25 min |
| **[Fixtures & Setup](./playwright_elements_fixtures.html)** | Configure your test environment | 20 min |
| **[Architecture & Patterns](./architecture.html)** | Advanced patterns and best practices | 45 min |

---

## Need Help?

- **Documentation**: [Full Documentation Index](../README.md)
- **Issues**: [GitHub Issues](https://github.com/DanteUkraine/playwright-elements/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DanteUkraine/playwright-elements/discussions)

---

[Go to Main Page >>](./../README.md)
