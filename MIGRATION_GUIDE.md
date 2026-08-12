# Migration Guide: Mocha/Chai → @playwright/test

## Overview

This guide documents the migration from Mocha/Chai test framework to @playwright/test for the playwright-elements project.

## Benefits of Migration

1. **Native Playwright Integration** - Better support for Playwright features
2. **TypeScript 7+ Support** - Can upgrade beyond TypeScript 5.x
3. **Better Test Isolation** - Built-in test fixtures and cleanup
4. **Parallel Test Execution** - Built-in support for parallel test execution
5. **Modern Assertions** - Playwright's expect has better error messages
6. **Built-in Retries** - Automatic retry for flaky tests
7. **Better Debugging** - Built-in trace viewer and UI mode

## Migration Pattern

### Before (Mocha/Chai):

```typescript
import { BrowserInstance, BrowserName, configureWebElementExpect } from '../src';
import { test } from 'mocha';
import { expect } from 'chai';

describe('Test Suite', function () {
    before(async () => {
        configureWebElementExpect();
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
    })

    after(async () => {
        await BrowserInstance.close();
    })

    test('test case', async () => {
        // test code
        expect(result).to.equal(expected);
    })
})
```

### After (@playwright/test):

```typescript
import { test, expect } from '../src';

test.describe('Test Suite', () => {
    test.beforeEach(async ({ initBrowserInstance, goto }) => {
        // BrowserInstance is initialized automatically by fixture
        await goto(localFilePath);
    })

    test('test case', async ({ initBrowserInstance }) => {
        // test code
        expect(result).toBe(expected);
    })
})
```

## Key Changes

### 1. Imports
- **Old**: `import { test } from 'mocha'; import { expect } from 'chai';`
- **New**: `import { test, expect } from '../src';` (or from '@playwright/test')

### 2. Test Structure
- **Old**: `describe()`, `test()`, `before()`, `after()`, `beforeEach()`, `afterEach()`
- **New**: `test.describe()`, `test()`, `test.beforeEach()`, `test.afterEach()`

### 3. Browser Management
- **Old**: Manual `BrowserInstance.start()`, `BrowserInstance.close()`
- **New**: Automatic via `initBrowserInstance` fixture (from src/playwright.test.fixtures.ts)

### 4. Navigation
- **Old**: `BrowserInstance.currentPage.goto(url)`
- **New**: Use `goto` fixture: `await goto(url)`

### 5. Assertions
- **Old**: `expect(value).to.equal(expected)`, `expect(value).to.be.true`
- **New**: `expect(value).toBe(expected)`, `expect(value).toBeTruthy()`

### Common Chai → Playwright Assertion Mappings:

| Chai | Playwright | Notes |
|------|------------|-------|
| `expect(x).to.equal(y)` | `expect(x).toBe(y)` | Deep equality |
| `expect(x).to.be.true` | `expect(x).toBeTruthy()` | Truthy check |
| `expect(x).to.be.false` | `expect(x).toBeFalsy()` | Falsy check |
| `expect(x).to.be.null` | `expect(x).toBeNull()` | Null check |
| `expect(x).to.be.undefined` | `expect(x).toBeUndefined()` | Undefined check |
| `expect(x).to.have.length(n)` | `expect(x).toHaveLength(n)` | Array length |
| `expect(x).to.contain(y)` | `expect(x).toContain(y)` | Array contains |
| `expect(x).to.include(y)` | `expect(x).toContain(y)` | String/array includes |
| `expect(x).to.throw()` | `expect(() => x()).toThrow()` | Exception |
| `expect(x).to.deep.equal(y)` | `expect(x).toEqual(y)` | Deep equality |
| `expect(x).to.have.property('p')` | `expect(x).toHaveProperty('p')` | Property exists |
| `expect(x).to.be.a('string')` | `expect(typeof x).toBe('string')` | Type check |
| `expect(x).to.be.above(y)` | `expect(x).toBeGreaterThan(y)` | Greater than |
| `expect(x).to.be.below(y)` | `expect(x).toBeLessThan(y)` | Less than |
| `expect(x).to.be.at.least(y)` | `expect(x).toBeGreaterThanOrEqual(y)` | >= |
| `expect(x).to.be.at.most(y)` | `expect(x).toBeLessThanOrEqual(y)` | <= |

## Fixtures Available

The project provides custom fixtures in `src/playwright.test.fixtures.ts`:

- **`test`** - Base test function with extended fixtures
- **`expect`** - Playwright expect with WebElement extensions
- **`initBrowserInstance`** - Auto-initializes and cleans up BrowserInstance
- **`goto`** - Navigate to URL (wraps page.goto)
- **`usePage`** - Use custom page context

## Migration Checklist

- [ ] Replace imports: mocha/chai → @playwright/test
- [ ] Replace describe/test hooks with test.describe/test
- [ ] Replace before/after with test.beforeEach/test.afterEach
- [ ] Replace BrowserInstance.start() with initBrowserInstance fixture
- [ ] Replace BrowserInstance.currentPage.goto() with goto() fixture
- [ ] Update assertions from Chai to Playwright expect
- [ ] Remove manual BrowserInstance.close() calls (handled by fixture)
- [ ] Test the migrated file
- [ ] Remove old test file once verified

## Performance Considerations

The current mocha configuration runs tests sequentially (`parallel: false`). The new Playwright configuration also runs sequentially (`fullyParallel: false, workers: 1`).

After full migration, consider enabling parallel execution:
```typescript
fullyParallel: true,
workers: process.cpuCount() || 4,
```

This can significantly reduce test execution time.

## Coverage

The current coverage command uses `c8 npm test`. After migration, update to:
```json
"test:coverage": "npx playwright test --coverage --config=playwright.unit.config.ts"
```

## Running Tests

### During migration (both frameworks):
```bash
# Run mocha tests (old)
npm run test:mocha

# Run playwright tests (new)
npm test
```

### After full migration:
```bash
# Run all tests
npm test

# Run with UI mode
npm run test:unit:ui

# Run with headed browser
npm run test:single
```

## Files to Migrate

See MIGRATION_STATUS.md for current status.

## Troubleshooting

### Error: BrowserInstance not initialized
Make sure to include `initBrowserInstance` in test parameters:
```typescript
test('test', async ({ initBrowserInstance }) => {
    // BrowserInstance is now initialized
})
```

### Error: Cannot find name 'expect'
Import expect from '../src' or '@playwright/test'.

### Error: Timeout exceeded
Increase timeout in playwright.unit.config.ts or for specific tests:
```typescript
test('slow test', async ({}, testInfo) => {
    testInfo.setTimeout(60000);
})
```

## Benefits Realized After Migration

1. **Faster Test Execution** - Parallel test execution support
2. **Better TypeScript Support** - Can use TypeScript 7+ with full type checking
3. **Improved Debugging** - Built-in trace viewer for failed tests
4. **Automatic Retries** - Built-in test retry mechanism
5. **Better Error Messages** - Playwright's expect has superior error messages
6. **Modern Test Features** - Support for test hooks, fixtures, etc.
7. **Active Community** - @playwright/test is actively maintained
8. **Better Integration** - Native Playwright features work seamlessly
