# Playwright-elements: Comprehensive Web Testing Framework

[![Awesome](https://awesome.re/mentioned-badge.svg)](https://github.com/mxschmitt/awesome-playwright/blob/master/README.md#utils)

**Playwright-elements** is a powerful testing framework that extends Playwright with:

✅ **Reusable Components** - Build hierarchical UI components with child elements
✅ **Type Safety** - Full TypeScript support with branded types for test IDs
✅ **Chainable API** - Fluent interface mixing selectors with synchronous methods
✅ **Page Object Pattern** - Clean architecture for maintainable tests
✅ **Test ID System** - Type-safe, collision-resistant test ID generation
✅ **Framework Integration** - Seamless React/JSX support and automatic fixtures

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install -D playwright-elements
```

### 2. Basic Usage
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

### Type-Safe Test IDs (v1.19.0+)
Prevent selector typos and ensure type safety across your entire test suite:

```typescript
import { factory, sid, $byTestId, testIdProps } from 'playwright-elements';

// Define typed IDs
const ids = {
  login: {
    username: sid<'login.username'>('username-input'),
    password: sid<'login.password'>('password-input'),
  },
  button: factory<'button'>('btn')
};

// Use in React components
function MyComponent() {
  return <input {...testIdProps(ids.login.username)} />;
}

// Use in tests
const usernameField = $byTestId(ids.login.username);
await usernameField.fill('admin');
```

---

## 📚 Learning Path

| Level | Topic | Duration |
|-------|-------|----------|
| 🟢 Beginner | [Get Started](https://danteukraine.github.io/playwright-elements/docs/get_started.html) | 15 min |
| 🟡 Intermediate | [WebElement Deep Dive](https://danteukraine.github.io/playwright-elements/docs/web_element.html) | 30 min |
| 🔵 Advanced | [Test IDs Module](https://danteukraine.github.io/playwright-elements/docs/test_ids.html) | 20 min |
| 🟣 Expert | [Architecture & Patterns](https://danteukraine.github.io/playwright-elements/docs/architecture.html) | 45 min |

---

## 🎯 Advanced Patterns

### Component-Driven Testing
Organize your tests around reusable components rather than pages:

```typescript
// elements.ts
export const header = $('.header').with({ logo: $('.logo') });
export const form = $('.login-form').with({
  usernameInput: $('input[name="username"]'),
  passwordInput: $('input[name="password"]'),
  loginButton: $('button[type="submit"]'),
  async fillForm(userName: string, password: string) {
    await this.usernameInput.fill(userName);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
});

// fixtures.ts
import { test as baseTest } from 'playwright-elements';
import * as elements from './elements';

type TestFixtures = { elements: typeof elements };

export const test = baseTest.extend({
  elements: [async ({}, use) => {
    await use(elements);
  }, { scope: 'test' }],
});

// test.ts
test('check login page', async ({ elements }) => {
  await elements.form.fillForm('UserName', 'Pass!');
  await elements.header.logo.expect().toBeVisible();
  await elements.header.avatar.expect().toBeVisible();
});
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

export const test = baseTest.extend({
  pageObject: [async ({}, use) => {
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

## 📖 Documentation

| Section | Description |
|---------|-------------|
| [Get Started](https://danteukraine.github.io/playwright-elements/docs/get_started.html) | Installation and basic usage |
| [Web Element](https://danteukraine.github.io/playwright-elements/docs/web_element.html) | Complete WebElement API reference |
| [Test IDs](https://danteukraine.github.io/playwright-elements/docs/test_ids.html) | Type-safe test ID system |
| [Page Objects](https://danteukraine.github.io/playwright-elements/docs/build_page_object.html) | Page object pattern guide |
| [Fixtures](https://danteukraine.github.io/playwright-elements/docs/playwright_elements_fixtures.html) | Test fixture configuration |
| [Browser Management](https://danteukraine.github.io/playwright-elements/docs/browser_instance.html) | Advanced browser control |
| [Architecture](https://danteukraine.github.io/playwright-elements/docs/architecture.html) | Framework design principles |
| [Migration Guide](https://danteukraine.github.io/playwright-elements/docs/migration_guide.html) | Upgrade instructions |
| [FAQ](https://danteukraine.github.io/playwright-elements/docs/faq.html) | Common questions and solutions |

---

[![Stars](https://img.shields.io/github/stars/DanteUkraine/playwright-elements.svg?style=social&label=Star)](https://github.com/DanteUkraine/playwright-elements)
[![Forks](https://img.shields.io/github/forks/DanteUkraine/playwright-elements.svg?style=social&label=Fork)](https://github.com/DanteUkraine/playwright-elements)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
