---
layout: default
title: Troubleshooting
---
[Go to Main Page >>](./../README.md)

# Troubleshooting Guide

Common issues and solutions when working with playwright-elements.

- [Setup & Installation Issues](#setup--installation-issues)
- [Selector & Locator Issues](#selector--locator-issues)
- [Type System Issues](#type-system-issues)
- [Test Execution Issues](#test-execution-issues)
- [Performance Issues](#performance-issues)
- [Browser & Context Issues](#browser--context-issues)
- [CI/CD Issues](#cicd-issues)
- [Debugging Tips](#debugging-tips)
- [Error Message Reference](#error-message-reference)

---

## Setup & Installation Issues

### "Cannot find module 'playwright-elements'"

**Symptoms:** Import statements fail with module not found error.

**Solutions:**

1. **Install the package:**
   ```bash
   npm install -D playwright-elements
   # or
   yarn add -D playwright-elements
   # or
   pnpm add -D playwright-elements
   ```

2. **Check Node.js version:** Ensure you're using Node.js 18.x, 20.x, 22.x, or 24.x:
   ```bash
   node -v
   ```

3. **Verify TypeScript version:** Ensure TypeScript >= 4.3.x:
   ```bash
   tsc -v
   ```

4. **Check peer dependencies:** playwright-elements requires Playwright >= 1.44.x:
   ```bash
   npm install -D @playwright/test
   ```

### "Peer dependency warnings"

**Symptoms:** npm/yarn warns about missing peer dependencies.

**Solution:** Install the required Playwright version:
```bash
npm install -D @playwright/test@^1.44.0
npm install -D playwright-core@^1.44.0
```

Or use the automatic installation:
```bash
npx playwright install
```

### "TypeScript compilation errors"

**Symptoms:** TypeScript fails to compile with errors about types.

**Solutions:**

1. **Ensure type definitions are available:**
   ```bash
   npm install -D @types/node @types/mocha @types/chai
   ```

2. **Check tsconfig.json:** Ensure proper configuration:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "CommonJS",
       "lib": ["ES2020"],
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     },
     "include": ["src/**/*", "test/**/*"],
     "exclude": ["node_modules", "lib"]
   }
   ```

3. **Clean and rebuild:**
   ```bash
   npm run clean
   npm run build
   ```

---

## Selector & Locator Issues

### "Element not found" or "Locator not found"

**Symptoms:** Tests fail because elements cannot be found on the page.

**Debugging Steps:**

1. **Verify the selector:**
   ```typescript
   // Check if element exists
   const count = await $('.your-selector').count();
   console.log(`Found ${count} elements`);
   ```

2. **Check the rendered HTML:**
   ```typescript
   const html = await BrowserInstance.currentPage.content();
   console.log(html);
   ```

3. **Use more specific selectors:**
   ```typescript
   // Instead of:
   const element = $('.button');
   
   // Use:
   const element = $('button[type="submit"]');
   // or
   const element = $('button').hasText('Submit');
   // or
   const element = $getByTestId('submit-button');
   ```

4. **Check timing:** Element might not be visible yet:
   ```typescript
   await $('.your-selector').waitFor({ state: 'visible' });
   ```

### "Selector chain too complex"

**Symptoms:** Long selector chains fail or cause performance issues.

**Solutions:**

1. **Break down complex selectors:**
   ```typescript
   // Instead of:
   const element = $('div > ul > li > a').has($('span')).hasText('Link');
   
   // Use:
   const listItem = $('li').has($('span'));
   const link = listItem.$('a').hasText('Link');
   ```

2. **Use `getBy` methods for better readability:**
   ```typescript
   const button = $getByRole('button', { name: 'Submit' });
   const input = $getByLabel('Email');
   ```

3. **Simplify with CSS classes:**
   ```typescript
   // Add test-specific classes to your HTML
   const element = $('.test-submit-button');
   ```

### "Selector resolved to multiple elements"

**Symptoms:** Operations fail because selector matches more than one element.

**Solutions:**

1. **Use `nth()` to select specific element:**
   ```typescript
   const firstElement = $('.selector').nth(0);
   const lastElement = $('.selector').nth(-1);
   ```

2. **Use `first()` or `last()`:**
   ```typescript
   const first = $('.selector').first();
   const last = $('.selector').last();
   ```

3. **Make selector more specific:**
   ```typescript
   // Add additional filters
   const element = $('.selector').hasText('Specific Text');
   const element = $('.selector').has($('.icon'));
   ```

4. **Use `filter()`:**
   ```typescript
   const filtered = $('.selector').filter({
     hasText: 'Exact Text',
     hasNot: $('.disabled')
   });
   ```

---

## Type System Issues

### "Property 'X' does not exist on type 'WebElement'"

**Symptoms:** TypeScript error when trying to access a property.

**Cause:** The property wasn't defined in the `with()` call.

**Solutions:**

1. **Add the property to `with()`:**
   ```typescript
   // ❌ Wrong
   const form = $('.form');
   form.username.click();  // Error
   
   // ✅ Correct
   const form = $('.form').with({
     username: $('input[name="username"]')
   });
   form.username.click();  // OK
   ```

2. **Check for typos:**
   ```typescript
   const form = $('.form').with({
     userName: $('input')  // Note: userName, not username
   });
   form.username.click();  // Error: should be userName
   ```

3. **Use type assertions (last resort):**
   ```typescript
   const form = $('.form') as WebElement & { username: WebElement };
   form.username.click();
   ```

### "'this' implicitly has type 'any'"

**Symptoms:** TypeScript warns that `this` is implicitly any.

**Cause:** Method wasn't added through `with()` or type annotation is missing.

**Solutions:**

1. **Add method through `with()`:**
   ```typescript
   // ❌ Wrong
   const form = $('.form').with({
     username: $('input')
   });
   form.login = async function() {
     // this is any
     await this.username.click();
   };
   
   // ✅ Correct
   const form = $('.form').with({
     username: $('input'),
     login: async function() {
       // this is properly typed
       await this.username.click();
     }
   });
   ```

2. **Explicitly annotate the function:**
   ```typescript
   const form = $('.form').with({
     username: $('input'),
     login: async function(this: WebElement & { username: WebElement }) {
       await this.username.click();
     }
   });
   ```

### "Type 'X' is not assignable to type 'WebElement'"

**Symptoms:** TypeScript error when assigning values in `with()`.

**Solutions:**

1. **Ensure you're creating WebElement instances:**
   ```typescript
   // ❌ Wrong
   const form = $('.form').with({
     username: 'input[name="username"]'  // String, not WebElement
   });
   
   // ✅ Correct
   const form = $('.form').with({
     username: $('input[name="username"]')  // WebElement
   });
   ```

2. **Use factory functions:**
   ```typescript
   const form = $('.form').with({
     username: $getByTestId('username'),
     password: $getByLabel('Password')
   });
   ```

### "Maximum call stack size exceeded" during compilation

**Symptoms:** TypeScript compilation fails with stack overflow.

**Cause:** Too deep nesting in type definitions.

**Solutions:**

1. **Reduce nesting depth:**
   ```typescript
   // Instead of deeply nested:
   const a = $('.a').with({
     b: $('.b').with({
       c: $('.c').with({
         d: $('.d').with({
           e: $('.e')
         })
       })
     })
   });
   
   // Flatten the structure:
   const e = $('.e');
   const d = $('.d').with({ e });
   const c = $('.c').with({ d });
   const b = $('.b').with({ c });
   const a = $('.a').with({ b });
   ```

2. **Increase TypeScript's recursion depth limit:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "maxNodeModuleJsDepth": 10
     }
   }
   ```

3. **Simplify complex types:**
   ```typescript
   // Break down large with() calls
   const baseForm = $('.form').with({
     username: $('input[name="username"]'),
     password: $('input[name="password"]')
   });
   
   const formWithMethods = baseForm.with({
     login: async function() {
       await this.username.fill('user');
     }
   });
   ```

---

## Test Execution Issues

### "Timeout exceeded"

**Symptoms:** Tests fail because operations take too long.

**Solutions:**

1. **Increase timeout:**
   ```typescript
   await $('.selector').click({ timeout: 10000 });
   await $('.selector').waitFor({ timeout: 10000 });
   ```

2. **Check for missing waits:**
   ```typescript
   // ❌ Might fail if element not ready
   await $('.selector').click();
   
   // ✅ Better
   await $('.selector').waitFor({ state: 'visible' });
   await $('.selector').click();
   ```

3. **Use `softExpect` for assertions:**
   ```typescript
   await $('.selector').softExpect().toBeVisible();
   ```

4. **Check for iframes:**
   ```typescript
   // If element is in iframe
   const frame = $('iframe').contentFrame();
   const element = frame.$('.selector');
   ```

### "Element is not visible"

**Symptoms:** Operations fail because element is not visible.

**Solutions:**

1. **Scroll element into view:**
   ```typescript
   await $('.selector').scrollIntoViewIfNeeded();
   await $('.selector').click();
   ```

2. **Wait for visibility:**
   ```typescript
   await $('.selector').waitFor({ state: 'visible' });
   ```

3. **Check for CSS properties:**
   ```typescript
   // Check if element is hidden by CSS
   const isVisible = await $('.selector').isVisible();
   const isHidden = await $('.selector').isHidden();
   ```

4. **Use `force` option:**
   ```typescript
   await $('.selector').click({ force: true });
   ```

### "Element is disabled"

**Symptoms:** Click/fill operations fail on disabled elements.

**Solutions:**

1. **Check and handle disabled state:**
   ```typescript
   const isDisabled = await $('.selector').isDisabled();
   if (isDisabled) {
     await $('.enable-button').click();
   }
   ```

2. **Use `force` option:**
   ```typescript
   await $('.selector').click({ force: true });
   await $('.selector').fill('text', { force: true });
   ```

3. **Enable element first:**
   ```typescript
   await $('.selector').setChecked(true);
   await $('.selector').click();
   ```

---

## Performance Issues

### "Tests are running slowly"

**Symptoms:** Test suite takes a long time to execute.

**Debugging Steps:**

1. **Identify slow tests:**
   ```bash
   # Run with verbose output
   npm test -- --reporter spec
   ```

2. **Check for unnecessary waits:**
   ```typescript
   // ❌ Unnecessary wait
   await new Promise(resolve => setTimeout(resolve, 5000));
   
   // ✅ Better: wait for specific condition
   await $('.selector').waitFor({ state: 'visible' });
   ```

3. **Avoid repeated element creation:**
   ```typescript
   // ❌ Creates element each time
   function clickButton() {
     return $('.button').click();
   }
   
   // ✅ Reuse element
   const button = $('.button');
   function clickButton() {
     return button.click();
   }
   ```

4. **Use parallel test execution:**
   ```bash
   # Run tests in parallel
   npm test -- --parallel
   ```

### "Memory usage is high"

**Symptoms:** Node.js process uses excessive memory.

**Solutions:**

1. **Clean up resources:**
   ```typescript
   afterEach(async () => {
     // Clear cookies, storage, etc.
     await BrowserInstance.clearContext();
   });
   ```

2. **Limit concurrent tests:**
   ```bash
   # Reduce worker count
   npm test -- --workers 2
   ```

3. **Check for memory leaks:**
   ```typescript
   // Use Chrome DevTools to profile memory
   // or use --inspect flag
   node --inspect node_modules/.bin/ts-mocha
   ```

---

## Browser & Context Issues

### "Cannot access page" or "Page not initialized"

**Symptoms:** Tests fail because BrowserInstance.currentPage is not available.

**Solutions:**

1. **Ensure fixtures are used:**
   ```typescript
   import { test } from 'playwright-elements';
   
   test('my test', async () => {
     // BrowserInstance.currentPage is available here
   });
   ```

2. **Check test setup:**
   ```typescript
   import { BrowserInstance } from 'playwright-elements';
   
   before(async () => {
     await BrowserInstance.init();
   });
   
   after(async () => {
     await BrowserInstance.close();
   });
   ```

3. **Verify BrowserInstance state:**
   ```typescript
   console.log(BrowserInstance.isInitialized);
   console.log(BrowserInstance.currentPage?.url());
   ```

### "Context issues between tests"

**Symptoms:** Tests interfere with each other due to shared context.

**Solutions:**

1. **Use separate contexts:**
   ```typescript
   test.beforeEach(async ({ context }) => {
     const page = await context.newPage();
     await usePage(page);
   });
   ```

2. **Clean up between tests:**
   ```typescript
   test.afterEach(async () => {
     await BrowserInstance.clearContext();
     await BrowserInstance.clearCookies();
   });
   ```

3. **Use isolated tests:**
   ```typescript
   test('isolated test', async () => {
     const browser = await chromium.launch();
     const context = await browser.newContext();
     const page = await context.newPage();
     await usePage(page);
     
     // Test code
     
     await browser.close();
   });
   ```

---

## CI/CD Issues

### "Tests timeout in GitHub Actions"

**Symptoms:** Tests pass locally but timeout in CI.

**Solutions:**

1. **Increase timeout:**
   ```yaml
   # .github/workflows/tests.yml
   jobs:
     test:
       timeout-minutes: 15
   ```

2. **Add `--exit` flag to test command:**
   ```json
   // package.json
   "test": "ts-mocha --exit"
   ```

3. **Run with headless browsers:**
   ```yaml
   env:
     HEADLESS: true
   ```

4. **Check resource allocation:**
   ```yaml
   runs-on: ubuntu-latest
   ```

### "Browser installation fails in CI"

**Symptoms:** Browser installation fails or takes too long.

**Solutions:**

1. **Install browsers explicitly:**
   ```bash
   npx playwright install --with-deps chromium firefox webkit
   ```

2. **Cache browsers in CI:**
   ```yaml
   # .github/workflows/tests.yml
   - name: Cache browsers
     uses: actions/cache
     with:
       path: |
         ~/.cache/ms-playwright
       key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}
   ```

3. **Use pre-installed browsers:**
   ```yaml
   runs-on: ubuntu-latest
   steps:
     - uses: actions/setup-node
     - uses: microsoft/playwright-github-action@main
   ```

---

## Debugging Tips

### Enable Debug Logging

```typescript
import { BrowserInstance } from 'playwright-elements';

// Enable debug mode
BrowserInstance.debugMode = true;

// This will log detailed information about selectors and operations
```

### Log Selector Information

```typescript
const element = $('.my-selector');
console.log('Selector:', element.selector);
console.log('Narrow Selector:', element.narrowSelector);
console.log('Parent Selectors:', element.parentsSelector);
```

### Use Playwright Inspector

```typescript
// Pause test execution for manual inspection
await BrowserInstance.currentPage.pause();
```

Then use Playwright Inspector to debug:
```bash
npx playwright codegen https://your-app.com
```

### Log Page State

```typescript
// Get full page HTML
const html = await BrowserInstance.currentPage.content();
console.log(html);

// Get screenshot
const screenshot = await BrowserInstance.currentPage.screenshot();
require('fs').writeFileSync('debug.png', screenshot);
```

### Debug TypeScript Types

Create a test file to inspect types:

```typescript
// debug-types.ts
import { $, WebElement } from 'playwright-elements';

const form = $('.form').with({
  username: $('input'),
  login: async function() {
    // Use expect-type to verify types
    await expectType.of(this.username).toMatchTypeOf<WebElement>();
    await expectType.of(this.login).toMatchTypeOf<() => Promise<void>>();
  }
});

// Run with:
// npx expect-type debug-types.ts
```

---

## Error Message Reference

### Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Cannot read properties of undefined (reading 'locator')` | BrowserInstance not initialized | Use test fixtures or call `BrowserInstance.init()` |
| `Element not found` | Selector doesn't match any elements | Verify selector, check if element is visible |
| `TimeoutError: Waiting for selector` | Element not visible within timeout | Increase timeout, check for dynamic content |
| `Error: Page closed` | Page was closed during test | Check test cleanup, use `beforeEach/afterEach` |
| `TypeError: this._selector is not a function` | Incorrect selector type | Ensure selector is a string, not a function |
| `Error: Can not add method with name 'X'` | Method name conflicts with existing property | Use a different method name |
| `Error: has option can not be used with getBy*` | Using `has()` with getBy methods | Use `has()` only with `$()` or `new WebElement()` |

---

## Best Practices for Reliable Tests

1. **Always wait for elements to be ready:**
   ```typescript
   await element.waitFor({ state: 'visible' });
   ```

2. **Use unique selectors:**
   ```typescript
   // Good
   $getByTestId('submit-button');
   $getByRole('button', { name: 'Submit' });
   
   // Avoid
   $('.div > button');
   ```

3. **Clean up between tests:**
   ```typescript
   test.afterEach(async () => {
     await BrowserInstance.clearContext();
   });
   ```

4. **Use type-safe selectors:**
   ```typescript
   const button = $('button.submit');
   button.click();  // Type-safe
   ```

5. **Keep tests independent:**
   - Each test should start from a clean state
   - Avoid relying on state from previous tests

6. **Use proper error handling:**
   ```typescript
   try {
     await element.click();
   } catch (error) {
     console.error('Click failed:', error);
     throw error;
   }
   ```

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the FAQ:** [faq.md](faq.md)
2. **Review existing issues:** [GitHub Issues](https://github.com/DanteUkraine/playwright-elements/issues)
3. **Create a minimal reproduction:**
   ```typescript
   // Create a minimal test case that reproduces the issue
   import { test, expect, $ } from 'playwright-elements';
   
   test('reproduce issue', async () => {
     // Minimal code to reproduce the problem
   });
   ```
4. **Open a new issue:** [New Issue](https://github.com/DanteUkraine/playwright-elements/issues/new)

When reporting issues, please include:
- Node.js version
- TypeScript version
- Playwright version
- playwright-elements version
- Operating system
- Minimal reproduction code
- Error message and stack trace
