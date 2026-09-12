---
layout: default
title: Best Practices
---
[Go to Main Page >>](./../README.md)

# Best Practices for playwright-elements

> **Write maintainable, scalable, and type-safe end-to-end tests**

This guide covers recommended patterns, anti-patterns, and best practices for using playwright-elements effectively in real-world projects.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Naming Conventions](#naming-conventions)
- [Component Organization](#component-organization)
- [Test ID Strategies](#test-id-strategies)
- [Page Object Patterns](#page-object-patterns)
- [Selector Strategies](#selector-strategies)
- [Assertion Strategies](#assertion-strategies)
- [Testing Strategies](#testing-strategies)
- [Performance Optimization](#performance-optimization)
- [Type Safety Tips](#type-safety-tips)
- [Maintenance & Refactoring](#maintenance--refactoring)
- [Team Collaboration](#team-collaboration)
- [CI/CD Integration](#cicd-integration)

---

## Project Structure

A well-organized project structure is the foundation of maintainable tests.

### Recommended Structure

```
project/
├── src/                          # Application code
│   └── app/
│
├── test/                         # All test-related code
│   ├── fixtures/                  # Custom test fixtures
│   │   ├── index.ts              # Main fixtures file (re-export everything)
│   │   ├── auth.fixture.ts       # Auth-related fixtures
│   │   └── api.fixture.ts        # API-related fixtures
│   │
│   ├── pages/                    # Page objects
│   │   ├── base/                 # Base page classes
│   │   │   ├── BasePage.ts        # Common page functionality
│   │   │   └── BaseAuthPage.ts    # Auth page base class
│   │   │
│   │   ├── login.page.ts         # Login page
│   │   ├── dashboard.page.ts      # Dashboard page
│   │   ├── settings.page.ts       # Settings page
│   │   └── index.ts              # Auto-generated or manual index
│   │
│   ├── components/               # Reusable UI components
│   │   ├── header.component.ts   # Header component
│   │   ├── form.component.ts     # Form component
│   │   ├── table.component.ts    # Table component
│   │   └── index.ts
│   │
│   ├── testIds/                  # Test ID definitions
│   │   ├── index.ts              # Central test ID registry
│   │   ├── auth.ids.ts           # Auth-related IDs
│   │   └── common.ids.ts         # Common/Shared IDs
│   │
│   ├── utils/                    # Test utilities
│   │   ├── helpers.ts            # Helper functions
│   │   ├── waiters.ts            # Custom wait conditions
│   │   └── validators.ts         # Validation utilities
│   │
│   ├── data/                    # Test data
│   │   ├── factories/            # Data factories
│   │   ├── fixtures/             # Test fixtures
│   │   └── mocks/                # Mock data
│   │
│   └── specs/                   # Test files
│       ├── smoke/                # Smoke tests
│       ├── regression/           # Regression tests
│       ├── integration/          # Integration tests
│       ├── e2e/                  # End-to-end tests
│       └── api/                  # API tests
│
├── playwright.config.ts         # Playwright configuration
├── jest.config.js              # Jest config (if used)
├── tsconfig.json               # TypeScript config
└── package.json
```

### Alternative: Feature-Based Structure

For larger projects, organize by feature/domain:

```
test/
├── auth/                       # Authentication feature
│   ├── pages/                  # Auth-related pages
│   ├── components/             # Auth-related components
│   ├── testIds/                # Auth test IDs
│   └── specs/                  # Auth tests
│
├── dashboard/                  # Dashboard feature
│   ├── pages/
│   ├── components/
│   ├── testIds/
│   └── specs/
│
└── shared/                     # Shared resources
    ├── fixtures/
    ├── utils/
    └── testIds/
```

### Central Fixtures File

Create a central fixtures file that re-exports everything:

```typescript
// test/fixtures/index.ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import * as pageObjectModule from '../pages';
import * as componentModule from '../components';

// Configure page objects
type PageObjectFixtures = {
  pageObject: PageObject<typeof pageObjectModule>;
  components: typeof componentModule;
};

export const test = baseTest.extend<PageObjectFixtures>({
  pageObject: [
    async ({}, use) => {
      await use(buildPageObject(pageObjectModule));
    },
    { scope: 'test' }
  ],
  components: [
    async ({}, use) => {
      await use(componentModule);
    },
    { scope: 'test' }
  ],
});

// Re-export everything for convenience
export * from 'playwright-elements';
export * from '../pages';
export * from '../components';
export * from '../testIds';
export * from '../utils';
```

---

## Naming Conventions

### Page Objects

| Type | Convention | Example |
|------|------------|---------|
| Class name | PascalCase + `Page` suffix | `LoginPage`, `DashboardPage` |
| File name | kebab-case + `.page.ts` | `login.page.ts`, `dashboard.page.ts` |
| Properties | camelCase | `usernameField`, `submitButton` |
| Methods | camelCase + verb | `login()`, `getErrorMessage()` |

### Components

| Type | Convention | Example |
|------|------------|---------|
| Class/const name | PascalCase | `Header`, `FormField` |
| File name | kebab-case + `.component.ts` | `header.component.ts` |
| Properties | camelCase | `logo`, `menuButton` |
| Methods | camelCase + verb | `expand()`, `submit()` |

### Test IDs

| Type | Convention | Example |
|------|------------|---------|
| Static IDs | kebab-case | `submit-button`, `login-form` |
| Factory prefixes | kebab-case + `-` | `btn-`, `nav-`, `form-` |
| Type parameters | dot notation | `'auth.loginButton'`, `'form.input'` |

### Tests

| Type | Convention | Example |
|------|------------|---------|
| Test file | kebab-case + `.spec.ts` | `login.spec.ts`, `user-registration.spec.ts` |
| Test describe | Title Case | `Login Page`, `User Registration` |
| Test title | should + action | `should login successfully`, `should show error` |

---

## Component Organization

### The `with()` Method: When to Use

**Use `.with()` for:**
- Complex components with multiple elements
- Reusable UI components
- Components with custom methods
- Nested structures

**Avoid `.with()` for:**
- Simple, one-off elements
- Elements used in only one place
- Elements that don't have sub-elements or custom methods

### Component Granularity

**Too Fine-Grained (Avoid):**
```typescript
// Every single element is a separate component
const button = $('.button').with({});
const icon = $('.icon').with({});
```

**Too Coarse (Avoid):**
```typescript
// Entire page is one huge component
const page = $('.app').with({
  // 50+ properties
  header: $('.header'),
  footer: $('.footer'),
  form: $('.form'),
  // ...
});
```

**Just Right (Recommended):**
```typescript
// Logical groupings
const header = $('.header').with({
  logo: $('.logo'),
  navigation: $('.nav').with({
    items: $('.nav-item'),
    async openMenu(this: WebElement) {
      await this.click();
    }
  })
});

const loginForm = $('.login-form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
  async login(this: WebElement, username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
});
```

### Base Components

Create base components for common patterns:

```typescript
// components/base/form.component.ts
import { WebElement } from 'playwright-elements';

export abstract class BaseForm extends WebElement {
  abstract submit: WebElement;
  
  async submitForm() {
    await this.submit.click();
  }
  
  async isValid() {
    const errorMessages = await this.$('.error-message').getAll();
    return errorMessages.length === 0;
  }
}

// components/login.form.ts
import { $ } from 'playwright-elements';
import { BaseForm } from './base/form.component';

export class LoginForm extends BaseForm {
  readonly username = $('input[name="username"]');
  readonly password = $('input[name="password"]');
  readonly submit = $('button[type="submit"]');
  
  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitForm();
  }
}
```

---

## Test ID Strategies

### Centralized Test ID Registry

Create a central file for all test IDs:

```typescript
// testIds/index.ts
import { factory, sid, ns } from 'playwright-elements';

// Namespaced helpers
const authId = ns<'auth'>();
const formId = ns<'form'>();
const navId = ns<'nav'>();

export const ids = {
  // Authentication
  auth: {
    login: {
      form: sid<'auth.login.form'>('login-form'),
      username: sid<'auth.login.username'>('login-username'),
      password: sid<'auth.login.password'>('login-password'),
      submit: sid<'auth.login.submit'>('login-submit'),
      error: sid<'auth.login.error'>('login-error'),
    },
    logout: {
      button: sid<'auth.logout.button'>('logout-button'),
    },
    register: {
      link: sid<'auth.register.link'>('register-link'),
    }
  },
  
  // Navigation
  nav: {
    logo: sid<'nav.logo'>('nav-logo'),
    menu: {
      button: sid<'nav.menu.button'>('nav-menu-button'),
      item: factory<'nav.menu.item'>('nav-menu-item'),
    },
    breadcrumb: factory<'nav.breadcrumb'>('breadcrumb-'),
  },
  
  // Forms
  form: {
    input: factory<'form.input'>('form-input'),
    button: factory<'form.button'>('form-button'),
    error: factory<'form.error'>('form-error'),
    success: sid<'form.success'>('form-success-message'),
  },
  
  // Common elements
  common: {
    spinner: sid<'common.spinner'>('spinner'),
    toast: factory<'common.toast'>('toast'),
    modal: sid<'common.modal'>('modal'),
    overlay: sid<'common.overlay'>('overlay'),
  }
} as const;

// Validate no prefix collisions
import { assertNoPrefixCollisions } from 'playwright-elements';
assertNoPrefixCollisions(ids);
```

### Feature-Based Test ID Files

For larger projects, split test IDs by feature:

```typescript
// testIds/auth.ids.ts
export const authIds = {
  login: {
    form: sid<'auth.login.form'>('login-form'),
    username: sid<'auth.login.username'>('login-username'),
    // ...
  }
} as const;

// testIds/nav.ids.ts
export const navIds = {
  menu: {
    button: sid<'nav.menu.button'>('nav-menu-button'),
    // ...
  }
} as const;

// testIds/index.ts
export * from './auth.ids';
export * from './nav.ids';
// ...
```

### Test ID Naming Conventions

**Good:**
```typescript
// Descriptive and consistent
const button = sid<'auth.login.submit'>('login-submit-button');
const input = factory<'form.field'>('form-field-input');
```

**Avoid:**
```typescript
// Too generic
const btn = sid('button');
const inp = sid('input');

// Inconsistent
const LoginButton = sid('login-btn');
const password_field = sid('pw-field');
```

---

## Page Object Patterns

### Classic Page Object

```typescript
// pages/login.page.ts
import { $ } from 'playwright-elements';
import { ids } from '../testIds';
import { $byTestId } from 'playwright-elements';

export class LoginPage {
  // Using CSS selectors
  readonly usernameField = $('input[name="username"]');
  readonly passwordField = $('input[name="password"]');
  
  // Using Test IDs
  readonly submitButton = $byTestId(ids.auth.login.submit);
  readonly errorMessage = $byTestId(ids.auth.login.error);
  
  // Components
  readonly header = new HeaderComponent();
  readonly footer = new FooterComponent();
  
  async navigate() {
    await goto('/login');
  }
  
  async login(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
  
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
  
  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }
}
```

### Component-Driven Page Object

```typescript
// pages/dashboard.page.ts
import { $ } from 'playwright-elements';
import { HeaderComponent } from '../components/header.component';
import { TableComponent } from '../components/table.component';
import { SidebarComponent } from '../components/sidebar.component';

export class DashboardPage {
  readonly header = new HeaderComponent();
  readonly sidebar = new SidebarComponent();
  readonly dataTable = new TableComponent();
  
  async navigate() {
    await goto('/dashboard');
  }
  
  async openSettings() {
    await this.sidebar.settingsLink.click();
  }
  
  async searchForItem(query: string) {
    await this.header.searchInput.fill(query);
    await this.header.searchButton.click();
  }
}
```

### Factory Pattern for Pages

```typescript
// pages/index.ts
export * from './login.page';
export * from './dashboard.page';
export * from './settings.page';

// factories/page.factory.ts
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SettingsPage } from '../pages/settings.page';

export class PageFactory {
  static getPage(pageName: string) {
    switch (pageName) {
      case 'login':
        return new LoginPage();
      case 'dashboard':
        return new DashboardPage();
      case 'settings':
        return new SettingsPage();
      default:
        throw new Error(`Unknown page: ${pageName}`);
    }
  }
}
```

---

## Selector Strategies

### Selector Priority (Best to Worst)

1. **Test IDs** - Most stable, most readable
2. **ARIA attributes** - Semantic, stable
3. **Name attributes** - Usually stable
4. **CSS classes** - Can change, but often semantic
5. **CSS selectors** - Generic, can be fragile
6. **Text content** - Language-dependent, can change
7. **XPath** - Fragile, hard to read

### Test ID Usage

**Always prefer Test IDs:**
```typescript
// Best
const button = $byTestId(ids.auth.login.submit);

// Good (if you control the HTML)
const button = $getByRole('button', { name: 'Submit' });

// Acceptable
const button = $('button[type="submit"]');

// Avoid (fragile)
const button = $('div > button:first-child');
```

### ARIA Attributes

```typescript
// Good
const button = $getByRole('button', { name: 'Submit' });
const dialog = $getByRole('dialog');
const alert = $getByRole('alert');

// With ARIA labels
const closeButton = $getByLabel('Close');
const menuButton = $getByLabel('Open menu');
```

### Form Fields

```typescript
// Best
const username = $getByLabel('Username');
const email = $getByLabel('Email');

// Good
const username = $('input[name="username"]');
const email = $('input[type="email"]');

// Acceptable
const username = $('input#username');
const username2 = $('.username-input');

// Avoid
const username = $('input:nth-child(3)');
```

### Dynamic Content

For lists, tables, and dynamic content:

```typescript
// Factory for dynamic IDs
const row = factory<'table.row'>('table-row');
const cell = factory<'table.cell'>('table-cell');

// In component
<tr {...testIdProps(row(user.id))}>
  <td {...testIdProps(cell(`${user.id}-name`))}>{user.name}</td>
</tr>

// In test
const userRow = $byTestId(row(userId));
await userRow.expect().toContainText('John Doe');

// Or by prefix
const allRows = $byTestIdPrefix(row);
const johnRow = allRows.filter({ hasText: 'John Doe' });
```

### Avoid Over-Qualified Selectors

**Too specific (Avoid):**
```typescript
const button = $('body > div.container > div.header > nav > ul > li > button');
```

**Better:**
```typescript
const button = $byTestId(ids.nav.menu.button);
// or
const button = $getByRole('button', { name: 'Menu' });
// or
const button = $('.menu-button');
```

---

## Assertion Strategies

### Assertion Hierarchy

1. **Existence** - Is the element there?
2. **Visibility** - Can the user see it?
3. **State** - Is it in the correct state?
4. **Content** - Does it have the correct content?

```typescript
// 1. Existence
await element.expect().toBeAttached();

// 2. Visibility
await element.expect().toBeVisible();

// 3. State
await element.expect().toBeEnabled();
await element.expect().toBeChecked();

// 4. Content
await element.expect().toHaveText('Expected text');
await element.expect().toHaveValue('expected value');
```

### Soft vs Hard Assertions

| Use Soft Assertions When | Use Hard Assertions When |
|--------------------------|--------------------------|
| Checking multiple independent conditions | Checking critical path |
| Collecting all failures for debugging | Failing fast on critical errors |
| Non-critical validations | Core functionality |

```typescript
// Soft assertions for form validation
test('form validation', async ({ pageObject }) => {
  await pageObject.login.username.fill('');
  await pageObject.login.password.fill('');
  await pageObject.login.submit.click();
  
  // All validations run, all failures reported
  await pageObject.login.usernameError.softExpect().toBeVisible();
  await pageObject.login.passwordError.softExpect().toBeVisible();
  await pageObject.login.formError.softExpect().toContainText('required');
});

// Hard assertion for critical path
test('login redirects to dashboard', async ({ pageObject }) => {
  await pageObject.login.login('admin', 'password');
  // Fail immediately if redirect doesn't happen
  await pageObject.dashboard.header.expect().toBeVisible();
});
```

### Custom Assertion Messages

Always provide meaningful assertion messages:

```typescript
// Good
await element.expect('Login button should be visible after form submission').toBeVisible();

// Bad (no context)
await element.expect().toBeVisible();

// Acceptable (implicit from selector)
await $('.login-button').expect().toBeVisible();
```

### Assertion Order

Order assertions from most general to most specific:

```typescript
// Good
await element.expect().toBeVisible();
await element.expect().toBeEnabled();
await element.expect().toHaveText('Submit');

// Also good (logical order)
await element.expect().toBeAttached();
await element.expect().toBeVisible();
await element.expect().toBeEnabled();
```

---

## Testing Strategies

### Test Pyramid

Follow the test pyramid principle:

```
        ┌─────────────┐
        │   E2E (10%)  │  ← Few, comprehensive
        ├─────────────┤
        │ Integration   │
        │   (20%)      │
        ├─────────────┤
        │   Unit       │  ← Many, fast
        │  (70%)       │
        └─────────────┘
```

In playwright-elements context:
- **Unit**: Component tests (isolated components)
- **Integration**: Page tests (pages with multiple components)
- **E2E**: User journey tests (cross-page workflows)

### Test Granularity

**One Assertion per Test:**
```typescript
// Good - clear what's being tested
test('login button is visible', async ({ pageObject }) => {
  await pageObject.login.navigate();
  await pageObject.login.submitButton.expect().toBeVisible();
});

test('login button is enabled when form is valid', async ({ pageObject }) => {
  await pageObject.login.navigate();
  await pageObject.login.fillValidForm();
  await pageObject.login.submitButton.expect().toBeEnabled();
});

// Bad - testing multiple things
test('login button works', async ({ pageObject }) => {
  await pageObject.login.navigate();
  await pageObject.login.submitButton.expect().toBeVisible();
  await pageObject.login.submitButton.expect().toBeEnabled();
  await pageObject.login.submitButton.expect().toHaveText('Login');
});
```

### Test Data Management

Use factories for test data:

```typescript
// test/data/factories/user.factory.ts
export class UserFactory {
  static createUser(overrides?: Partial<User>) {
    return {
      id: `user-${Date.now()}`,
      username: `user${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    };
  }
  
  static createAdmin() {
    return this.createUser({ role: 'admin' });
  }
  
  static createStandardUser() {
    return this.createUser({ role: 'user' });
  }
}

// Usage in tests
test('user registration', async ({ pageObject }) => {
  const user = UserFactory.createUser();
  await pageObject.registration.register(user);
  await pageObject.dashboard.welcomeMessage.expect().toContainText(user.username);
});
```

### Test Isolation

Each test should be isolated:
- Use unique data for each test
- Clean up after each test (if needed)
- Avoid dependencies between tests

```typescript
// Good - isolated
test('user can login', async ({ pageObject }) => {
  const user = UserFactory.createUser();
  await pageObject.registration.register(user);
  await pageObject.login.login(user.username, 'password');
});

test('user can logout', async ({ pageObject }) => {
  const user = UserFactory.createUser();
  await pageObject.login.login(user.username, 'password');
  await pageObject.dashboard.logout();
});

// Bad - tests depend on each other
test('register and login', async ({ pageObject }) => {
  const user = UserFactory.createUser();
  await pageObject.registration.register(user);
});

test('logout after registration', async ({ pageObject }) => {
  // This test depends on the previous test's state
  await pageObject.dashboard.logout();
});
```

---

## Performance Optimization

### Lazy Loading

WebElement locators are lazy by default - they're only evaluated when used:

```typescript
// This doesn't query the DOM yet
const button = $('button');

// This queries the DOM
await button.click();
```

### Reuse Elements

Define elements at the page/component level, not in tests:

```typescript
// Good - defined once in page object
class LoginPage {
  readonly submitButton = $('button[type="submit"]');
}

// Usage in multiple tests
test('test 1', async ({ pageObject }) => {
  await pageObject.login.submitButton.click();
});

test('test 2', async ({ pageObject }) => {
  await pageObject.login.submitButton.expect().toBeEnabled();
});

// Bad - redefining in each test
test('test 1', async ({ page }) => {
  const button = $('button[type="submit"]');
  await button.click();
});

test('test 2', async ({ page }) => {
  const button = $('button[type="submit"]');
  await button.expect().toBeEnabled();
});
```

### Avoid Unnecessary Waits

```typescript
// Good - only wait when necessary
await element.click(); // Implicit wait

// Bad - unnecessary explicit waits
await page.waitForTimeout(1000);
await element.click();

// Better - use proper wait conditions
await element.waitFor();
await element.click();
```

### Parallel Test Execution

Run tests in parallel when possible:

```typescript
// playwright.config.ts
{
  workers: 4, // Use 4 parallel workers
  // or for CI
  workers: Math.max(1, Math.floor(os.cpus().length / 2)),
}
```

### Use `asyncForEach` for Data Collection

```typescript
// Good - parallel execution for data collection
const texts = [];
await elements.asyncForEach(async (e) => {
  texts.push(await e.textContent());
});

// Bad - sequential execution (slower)
const texts = [];
for (const e of await elements.getAll()) {
  texts.push(await e.textContent());
}
```

---

## Type Safety Tips

### Always Use Explicit Types

```typescript
// Good - explicit type
const button: WebElement = $('button');

// Better - with nested types
type Form = WebElement & {
  username: WebElement;
  password: WebElement;
  submit: WebElement;
};

const form: Form = $('.form').with({
  username: $('input[name="username"]'),
  password: $('input[name="password"]'),
  submit: $('button[type="submit"]'),
});
```

### Use `typeof this` for Custom Methods

```typescript
// Good - type-safe this
type Table = WebElement & {
  rows: WebElement;
};

const table: Table = $('.table').with({
  rows: $('.row'),
  
  async filterRows(this: Table, text: string) {
    return this.rows.filter({ hasText: text });
  }
});

// Bad - loses type safety
const table2 = $('.table').with({
  rows: $('.row'),
  
  async filterRows(text: string) {
    // this is any, no type safety
    return this.rows.filter({ hasText: text });
  }
});
```

### Parent Type Annotations

```typescript
// Good - type-safe parent access
const header = $('.header').with({
  logo: $('.logo'),
  login: $('#log-in').with({
    async hoverAndClick(this: WebElement) {
      // Type-safe access to parent
      await this.parent<typeof header>().logo.hover();
      await this.click();
    }
  })
});
```

### Use `as const` for Test ID Registries

```typescript
// Good - maintains literal types
export const ids = {
  login: {
    username: sid<'login.username'>('username-input'),
    password: sid<'login.password'>('password-input'),
  }
} as const;

// Bad - loses literal types
export const ids = {
  login: {
    username: sid('username-input'), // Type: TestId<string>
    password: sid('password-input'), // Type: TestId<string>
  }
}; // No type parameter
```

---

## Maintenance & Refactoring

### Version Control

Keep playwright-elements updated:

```bash
# Check for updates
npm outdated playwright-elements

# Update
npm install playwright-elements@latest

# Check breaking changes in migration guide
```

### Deprecation Strategy

When refactoring:

1. Update the implementation
2. Add deprecation warnings if needed
3. Update all usages
4. Remove old code in next major version

### Documentation

Document your page objects and components:

```typescript
/**
 * LoginPage - Represents the login page of the application
 * 
 * @example
 * ```typescript
 * const loginPage = new LoginPage();
 * await loginPage.login('admin', 'password');
 * ```
 */
export class LoginPage {
  /**
   * Username input field
   */
  readonly usernameField = $('input[name="username"]');
  
  /**
   * Logs in with the specified credentials
   * @param username - The username to login with
   * @param password - The password to login with
   */
  async login(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
}
```

---

## Team Collaboration

### Coding Standards

Establish team coding standards:

1. **Consistent Naming**: Follow the naming conventions in this guide
2. **Code Reviews**: Review each other's test code
3. **Pair Testing**: Write tests together for complex features
4. **Shared Utilities**: Create shared utilities in a central location

### Knowledge Sharing

1. **Document patterns**: Document common patterns your team uses
2. **Brown bag sessions**: Share testing tips and tricks
3. **Retrospectives**: Discuss testing challenges and solutions
4. **Mentoring**: Help new team members learn playwright-elements

### Code Ownership

1. **Collective ownership**: The whole team owns the tests
2. **Rotation**: Rotate test maintenance responsibilities
3. **Reviews**: Everyone reviews test code, not just production code

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run e2e tests
      run: npm run test:e2e
      env:
        BASE_URL: ${{ secrets.BASE_URL }}
        API_KEY: ${{ secrets.API_KEY }}
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results/
```

### Parallel Test Execution

```yaml
# Run tests in parallel across multiple jobs
jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:unit

  test-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:integration

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Test Reporting

Use reporting tools:

```bash
# Generate HTML report
npx playwright show-report

# Or use a custom reporter
npx playwright test --reporter=line,json
```

Configure in `playwright.config.ts`:

```typescript
{
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { outputFolder: 'test-results/html' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
}
```

---

## Checklist

### Before Committing Tests

- [ ] Tests pass locally
- [ ] No hardcoded values (use factories or constants)
- [ ] Type-safe selectors and IDs
- [ ] Clear assertion messages
- [ ] Tests are isolated
- [ ] No unnecessary waits
- [ ] Follows team conventions
- [ ] Documentation updated

### Before Merging PR

- [ ] All CI tests pass
- [ ] Code review completed
- [ ] Test coverage maintained or improved
- [ ] No test flakiness
- [ ] Breaking changes documented

---

## Additional Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Generation](https://playwright.dev/docs/codegen)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/best-practices.html)

---

[Go to Main Page >>](./../README.md)
