# Test Quality Guidelines

This document outlines best practices and standards for writing high-quality, maintainable tests in the playwright-elements project.

---

## Table of Contents

1. [General Principles](#general-principles)
2. [Assertion Quality](#assertion-quality)
3. [Test Structure](#test-structure)
4. [Test Data Management](#test-data-management)
5. [Cross-Browser & Cross-Platform Testing](#cross-browser--cross-platform-testing)
6. [Performance Considerations](#performance-considerations)
7. [Code Review Checklist](#code-review-checklist)
8. [Resources](#resources)

---

## General Principles

### ✅ DO

- **Write tests that validate behavior, not just state** - Tests should verify what the code *does*, not just what it *is*
- **Keep tests independent** - Each test should set up its own state and not depend on other tests
- **Use descriptive test names** - Test names should clearly describe the behavior being tested
- **Test edge cases** - Include tests for error conditions, boundary values, and unexpected inputs
- **Keep tests fast** - Aim for tests that complete in milliseconds, not seconds

### ❌ DON'T

- Write tests that depend on test execution order
- Use hardcoded waits or sleeps (`Thread.sleep`, `time.sleep`, `browser.sleep`)
- Include sensitive data or credentials in test files
- Create tests that take more than a few seconds to run
- Use flaky patterns that produce non-deterministic results

---

## Assertion Quality

### The Problem with Vacuous Assertions

Vacuous assertions are assertions that check **that** something happened without confirming **what** happened. They provide false confidence and can mask bugs.

### ❌ Avoid: Vacuous Assertions

```typescript
// BAD - Doesn't validate what "ok" means
expect(res?.ok()).toBeTruthy();

// BAD - Doesn't verify what mobile means
expect(BrowserInstance.isContextMobile).toBeTruthy();

// BAD - Doesn't check specific status
expect(status).toBeTruthy();
```

### ✅ Use: Specific, Meaningful Assertions

```typescript
// GOOD - Validates actual HTTP status
import { expectSuccessfulResponse } from '../test/utils/response.validators';
await expectSuccessfulResponse(res, 200);

// Or at minimum:
expect(res).not.toBeNull();
expect(res?.ok()).toBe(true);  // Explicit boolean check
expect(res?.status()).toBe(200);

// GOOD - Validates flag AND mobile-specific behavior
import { expectMobileContext } from '../test/utils/mobile.validators';
await expectMobileContext(page, { expectedDevice: 'iPhone' });

// Or at minimum:
expect(BrowserInstance.isContextMobile).toBe(true);  // Explicit boolean
expect(viewport?.width).toBeLessThanOrEqual(390);
expect(userAgent).toContain('iPhone');
```

### Why This Matters

| Assertion Type | Catches Bugs? | Maintainability | Readability |
|----------------|---------------|----------------|-------------|
| `toBeTruthy()` | ❌ Low | ❌ Poor | ❌ Unclear |
| `toBe(true)` + behavior | ✅ High | ✅ Good | ✅ Clear |

**Example:** If a response returns status 404, `res?.ok()` returns `false`, so `toBeTruthy()` fails. But if the test only checks `res?.ok()` without checking the actual status, you won't know if it's a 404, 500, or any other error.

### Assertion Hierarchy (Best to Worst)

1. **⭐⭐⭐⭐⭐ Validate specific behavior** - Check the actual outcome
   ```typescript
   expect(await element.textContent()).toBe('expected text');
   ```

2. **⭐⭐⭐⭐ Validate specific values** - Check exact expected values
   ```typescript
   expect(status).toBe(200);
   expect(isVisible).toBe(true);
   ```

3. **⭐⭐⭐ Use helper validators** - Use project validation utilities
   ```typescript
   await expectSuccessfulResponse(res);
   await expectMobileContext(page);
   ```

4. **⭐⭐ Explicit boolean checks** - At least be explicit
   ```typescript
   expect(x).toBe(true);
   expect(y).toBe(false);
   ```

5. **⭐ Avoid: Vacuous assertions** - Provides no real validation
   ```typescript
   expect(x).toBeTruthy();  // ❌ DON'T USE
   expect(y).toBeFalsy();   // ❌ DON'T USE
   ```

---

## Test Structure

### Recommended Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { $ } from '../src/index';

test.describe('Feature Name', () => {
    test.beforeEach(async ({ page }) => {
        // Setup that's common to all tests in this describe block
        await page.goto('/feature-page');
    });

    test('should do specific thing when condition', async ({ page }) => {
        // Arrange
        const element = $(`#element`);

        // Act
        await element.click();

        // Assert - be specific!
        await expect(element).toHaveAttribute('aria-expanded', 'true');
    });

    test('should handle error case gracefully', async ({ page }) => {
        // Test error conditions too
        const result = await safeCall(() => riskyOperation());
        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('expected error');
    });
});
```

### Test Naming Conventions

| Format | Example | When to Use |
|--------|---------|-------------|
| `should <behavior>` | `should navigate to page` | Standard behavior |
| `should <behavior> when <condition>` | `should show error when input invalid` | Conditional behavior |
| `should <behavior> with <scenario>` | `should render with mobile viewport` | Specific scenario |

**Avoid:**
- Test names that describe implementation (test *what*, not *how*)
- Vague names like `test1`, `test2`, `works`
- Names longer than 60-70 characters

---

## Test Data Management

### Fixture-Based Approach

Use Playwright's fixture system to manage test data:

```typescript
// Define custom fixtures
export const test = baseTest.extend({
    adminUser: [async ({}, use) => {
        const user = await createAdminUser();
        await use(user);
        await cleanupUser(user);
    }, { scope: 'test' }],
    
    regularUser: [async ({}, use) => {
        const user = await createRegularUser();
        await use(user);
        await cleanupUser(user);
    }, { scope: 'test' }],
});

// Use in tests
test('admin can access dashboard', async ({ page, adminUser }) => {
    await loginAs(page, adminUser);
    await expect(page).toHaveURL('/dashboard');
});
```

### Data Factories

Create factory functions for common test data:

```typescript
// test/factories/user.factory.ts
export function createUser(overrides: Partial<User> = {}): User {
    return {
        id: `user-${Date.now()}`,
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'user',
        ...overrides
    };
}

// Usage in tests
const user = createUser({ role: 'admin' });
```

---

## Cross-Browser & Cross-Platform Testing

### Device Emulation

```typescript
import { devices } from '@playwright/test';

test.use(devices['iPhone 13']);

test('mobile navigation', async ({ page }) => {
    // This test runs with iPhone 13 viewport and user agent
});
```

### Responsive Testing

```typescript
const viewportSizes = [
    { width: 375, height: 667 },   // Mobile
    { width: 768, height: 1024 },  // Tablet
    { width: 1280, height: 800 },  // Desktop
];

for (const viewport of viewportSizes) {
    test(`renders correctly at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        // Test responsive behavior
    });
}
```

---

## Performance Considerations

### Test Optimization Tips

1. **Reuse pages and contexts** - Don't create new pages for every test
2. **Use `test.beforeEach`** - Setup common state once per test
3. **Avoid unnecessary waits** - Use Playwright's auto-waiting instead of manual sleeps
4. **Run tests in parallel** - Use `test.describe.parallel` for independent test groups
5. **Mock external dependencies** - Use `test.mock()` for API calls

### Anti-Patterns to Avoid

```typescript
// ❌ BAD - Fixed delay
await page.waitForTimeout(1000);

// ✅ GOOD - Wait for specific condition
await page.waitForSelector('.loaded');
await expect(page.locator('.spinner')).not.toBeVisible();

// ❌ BAD - Polling with sleep
while (!condition) {
    await page.waitForTimeout(100);
}

// ✅ GOOD - Use built-in waiting
await expect(page.locator('.element')).toBeVisible();
```

---

## Code Review Checklist

### Before Approving a PR with Test Changes

- [ ] **Assertion Quality**
  - [ ] No `toBeTruthy()` or `toBeFalsy()` assertions
  - [ ] All assertions validate specific, meaningful behavior
  - [ ] Boolean checks use `toBe(true)` or `toBe(false)` explicitly

- [ ] **Test Independence**
  - [ ] Tests don't depend on execution order
  - [ ] Each test sets up its own state
  - [ ] Tests clean up after themselves

- [ ] **Flakiness Prevention**
  - [ ] No hardcoded sleeps or waits
  - [ ] Uses Playwright's auto-waiting mechanisms
  - [ ] Proper timeouts configured

- [ ] **Code Quality**
  - [ ] Test names are descriptive and clear
  - [ ] Test structure follows conventions
  - [ ] No sensitive data in test files
  - [ ] Tests are reasonably fast

- [ ] **Coverage**
  - [ ] Happy path is tested
  - [ ] Error cases are tested
  - [ ] Edge cases are considered
  - [ ] Test covers the intended behavior

---

## Available Validation Helpers

This project provides reusable validation utilities to help write better tests:

### Response Validators (`test/utils/response.validators.ts`)

```typescript
import { 
    expectValidResponse,
    expectSuccessfulResponse,
    expectRedirectResponse,
    expectClientErrorResponse,
    expectServerErrorResponse 
} from '../test/utils/response.validators';

// Validate successful response with status 200
await expectSuccessfulResponse(res);

// Validate response with custom options
await expectValidResponse(res, { 
    expectedStatus: 201, 
    checkContentType: 'application/json' 
});

// Validate redirect
await expectRedirectResponse(res, '/new-location');

// Validate error responses
await expectClientErrorResponse(res, 404);
await expectServerErrorResponse(res, 500);
```

### Mobile Context Validators (`test/utils/mobile.validators.ts`)

```typescript
import { 
    expectMobileContext,
    expectDesktopContext,
    expectViewport,
    expectViewportInRange,
    expectTouchSupport,
    expectOrientation,
    expectPixelRatio 
} from '../test/utils/mobile.validators';

// Validate mobile context
await expectMobileContext(page, { expectedDevice: 'iPhone' });

// Validate desktop context
await expectDesktopContext(page);

// Validate specific viewport
await expectViewport(page, { width: 390, height: 844 });

// Validate viewport range
await expectViewportInRange(page, { maxWidth: 500 });

// Validate touch support
await expectTouchSupport(page);

// Validate orientation
await expectOrientation(page, 'portrait');

// Validate pixel ratio
await expectPixelRatio(page, 3);
```

---

## Resources

### Internal Resources

- [Project README](README.md)
- [Playwright Documentation](https://playwright.dev/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Documentation](https://www.chaijs.com/)

### Test Quality Resources

- [Martin Fowler - Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Google Testing Blog](https://testing.googleblog.com/)
- [Test Doubles - Martin Fowler](https://martinfowler.com/bliki/TestDouble.html)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

### Playwright-Specific Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Annotations](https://playwright.dev/docs/test-annotations)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)

---

## Enforcement

### Pre-commit Hooks

This project uses husky pre-commit hooks to enforce test quality:

1. **ESLint** - Runs standard linting
2. **Vacuous Assertion Check** - Prevents `toBeTruthy()` and `toBeFalsy()` from being committed

To bypass hooks for a specific commit (use sparingly):
```bash
git commit --no-verify -m "Your message"
```

### CI/CD Checks

The CI/CD pipeline includes:
- Full test suite execution
- Linting checks
- Vacuous assertion detection

---

## Contributing to These Guidelines

These guidelines are a living document. If you have suggestions for improvements:

1. Open an issue with your proposal
2. Discuss with the team
3. Submit a PR with updates

Last updated: 2026-08-30
