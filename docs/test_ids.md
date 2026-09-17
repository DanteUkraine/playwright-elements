---
layout: default
title: Test IDs Module
---
[Go to Main Page >>](./../README.md)

# Test IDs Module

The Test IDs module is the part of `playwright-elements` that gives your suite a
single, shared source of truth for every `data-testid` value. The same registry
that stamps attributes in your application components is the one your page
objects and tests query against — with **compile-time type safety** and
**build-time removal of test IDs from production bundles**.

This keeps three concerns separate and explicit:

| Concern | Responsibility | Tools (from `playwright-elements`) |
| --- | --- | --- |
| **Build** an ID value | Produce a stable, collision-resistant string | `sid`, `factory`, `bareFactory`, `ns`, `unsafeId` |
| **Emit** an attribute | Stamp `data-testid` onto the DOM (or not) | `testIdProps`, `testIdValue`, `createStrippableAttribute` |
| **Read** an attribute | Build a selector / WebElement that matches the ID | `$byTestId`, `$byTestIdPrefix`, `$byTestIdContaining`, `$byTestIdEndingWith` |

The read side never strips: the ID *value* is identical in every build mode, so
a unit test, a runtime query, and an e2e spec can all share one selector.

The module enables:

- **Type safety** — each test ID has a branded type, preventing misuse
- **Autocompletion** — IDE support for available IDs
- **Refactoring support** — changes to IDs propagate through the codebase
- **React / Vue / Angular integration** — easy spreading or binding of test ID props
- **Prefix selectors** — convenient selectors for dynamic IDs
- **Production stripping** — `data-testid` removed from prod builds automatically

## Installation

The Test IDs module is included with `playwright-elements` v1.19.0 and later.
Install the full package to get the ID builders, the emission helpers, **and**
the Playwright-bound selectors (`$byTestId`, `$byTestIdPrefix`, ...) that return
`WebElement` instances:

```bash
npm install -D playwright-elements
```

```typescript
import { sid, factory, testIdProps, $byTestId, $byTestIdPrefix } from 'playwright-elements';
```

The Playwright config is synced automatically: when you set
`use.testIdAttribute: 'data-pw'`, the `$byTestId*` selectors follow that
attribute without any per-call argument.

### IDs only, without Playwright in `node_modules`

If you need the ID builders and emission helpers in production application code
or unit tests but do **not** want Playwright or lodash installed, use the
zero-dependency standalone package:

```bash
npm install -D @playwright-elements/testids
```

```typescript
import { sid, factory, testIdProps } from '@playwright-elements/testids';
```

The standalone package provides string selector builders (`testIdSelector`,
`testIdPrefixSelector`, ...) that return CSS strings. The Playwright-bound
`$byTestId*` selectors that return `WebElement` instances live only in the full
`playwright-elements` package. The `playwright-elements/testids` subpath also
works as a backward-compatible alternative (import-time isolation only).

## Production Stripping

Test IDs are a development-time concern, not a production-time concern. The
module automatically strips `data-testid` attributes from production builds —
no manual cleanup needed.

### How It Works

The strip decision is a single build-time-foldable module constant:

- **Default**: `NODE_ENV !== "production"` → **emit** (ids present in dev/test)
- **Override**: `PE_TESTIDS=on|off` overrides `NODE_ENV` in **both** directions

```bash
# Production build (ids stripped):
NODE_ENV=production npm run build

# Production build WITH ids (for e2e lane):
PE_TESTIDS=on NODE_ENV=production npm run build
```

The flag is written as literal `process.env` references so that bundlers
(webpack DefinePlugin, Vite `define`, esbuild `--define`) replace them at build
time, eliminating the dead branch entirely.

### Spread Pattern Incompatibility (Important)

Standard React attribute stripping tools **cannot** strip the spread form:

```typescript
// This is NOT stripped by compiler.reactRemoveProperties or babel-plugin-react-remove-properties:
<div data-testid="literal" {...testIdProps(ids.foo)}>x</div>

// The literal `data-testid` is removed, but the spread survives — silently shipping ids to production.
```

These transforms match `JSXAttribute` by name; `JSXSpreadAttribute` has no name.
Stripping **must** happen inside `testIdProps()`, which is what this module
does. When stripping is on, `testIdProps()` returns a frozen empty object, so
spreading is a no-op.

### Emission Helpers

Two binding styles are supported:

```typescript
import { testIdProps, testIdValue, sid } from 'playwright-elements';

// Spread form (React, Preact, Solid, Svelte, Vue v-bind):
<button {...testIdProps(sid('submit'))}>Submit</button>
// Dev:  <button data-testid="submit">Submit</button>
// Prod: <button>Submit</button>

// Bound form (Angular, Vue :attr):
// Angular: <div [attr.data-testid]="testIdValue(sid('my-id'))"></div>
// Vue:     <div :data-testid="testIdValue(sid('my-id'))"></div>
// Dev:  data-testid="my-id"
// Prod: attribute omitted (testIdValue returns undefined)
```

A custom attribute name can be passed as the second argument to match a custom
Playwright `use.testIdAttribute` config:

```tsx
<div {...testIdProps(sid('my-button'), 'data-pw')} />
```

### Verifying Stripping (R5)

Mode assertion — cheap, runs in any unit lane:

```typescript
import { testIds, sid } from 'playwright-elements';

it('emits ids in dev and test', () => {
  expect(testIds.enabled).toBe(true);
  expect(testIds.props(sid('submit'))).toEqual({ 'data-testid': 'submit' });
});
```

Artifact assertion — reads the built output:

```bash
# Must find nothing:
NODE_ENV=production npm run build
grep -r 'data-testid' <build output dir> && echo "FAIL: ids in prod build" || echo "OK"

# Override must put them back:
PE_TESTIDS=on NODE_ENV=production npm run build
grep -rq 'data-testid' <build output dir> && echo "OK" || echo "FAIL"
```

### `createStrippableAttribute` — Universal Strippable Primitive

For applications with multiple identity attributes (e.g. `data-testid`,
`data-section-part`, `data-qa`), the `createStrippableAttribute` primitive
provides one mechanism for all of them:

```typescript
import { createStrippableAttribute, sid } from 'playwright-elements';

// Canonical instance for data-testid (uses global flag):
const testIds = createStrippableAttribute('data-testid');

// Never strip (read by production CSS):
const sectionKind = createStrippableAttribute('data-section-kind', {
  enabled: true,
});

// Custom attribute:
const qaIds = createStrippableAttribute('data-qa');

// Usage:
sectionKind.props(sid('hero'));    // { 'data-section-kind': 'hero' } — always emitted
qaIds.props(sid('submit'));        // { 'data-qa': 'submit' } or {} — follows flag
```

### `createTestIds` — Configurable Factory

For isolated attribute configuration without global mutable state:

```typescript
import { createTestIds, sid } from 'playwright-elements';

const myIds = createTestIds({ attribute: 'data-pw' });
myIds.props(sid('submit'));     // { 'data-pw': 'submit' } or {}
myIds.selector(sid('submit'));  // '[data-pw="submit"]'
myIds.value(sid('submit'));     // 'submit' or undefined
```

## Core Concepts

### TestId Type

`TestId<K>` is a branded string type that represents a test ID. The generic
parameter `K` allows TypeScript to distinguish between different categories of
test IDs. The brand is **structural** (`'pe/testids'`), so two installed copies
of the package produce interoperable types — a realistic hoisting outcome.

```typescript
import { TestId, sid } from 'playwright-elements';

// Create typed test IDs
type ButtonId = TestId<'button'>;
type ContainerId = TestId<'container'>;

const buttonId: ButtonId = sid('submit-button');
const containerId: ContainerId = sid('main-container');

// Type error: cannot assign ContainerId to ButtonId
// const wrong: ButtonId = containerId;
```

### IdFactory

An `IdFactory` is a function that generates test IDs with a consistent prefix.
Each factory exposes its `.prefix` property for use with prefix selectors.

```typescript
import { factory } from 'playwright-elements';

// Create a factory for button IDs
const button = factory<'button'>('btn');

// Generate specific IDs
button('submit');  // Returns: 'btn-submit' as TestId<'button'>
button('cancel');  // Returns: 'btn-cancel' as TestId<'button'>

// Access the prefix
button.prefix;    // Returns: 'btn'
```

## API Reference

All of the following are exported from the main `playwright-elements` entry
point.

### ID builders

#### `sid<K extends string = string>(...parts: Array<string | number>): TestId<K>`

Builds a static ID from one or more kebab-case parts.

```typescript
import { sid } from 'playwright-elements';

// Simple static ID
const submitButton = sid('submit-button');

// ID with multiple parts
const userProfileLink = sid('user', 'profile', 'link');
// Results in: 'user-profile-link'

// Typed static ID
const headerTitle: TestId<'header'> = sid('header-title');
```

#### `ns<K extends string>(): (part: string | number) => TestId<K>`

Creates a namespaced ID helper function. This is a convenience wrapper around
`sid()` that enforces a specific type parameter for all IDs created with it.

```typescript
import { ns } from 'playwright-elements';

// Create a namespace for login-related IDs
const loginId = ns<'login'>();

// All IDs will be typed as TestId<'login'>
const usernameInput = loginId('username-input');  // TestId<'login'>
const passwordInput = loginId('password-input');  // TestId<'login'>

// Useful for organizing IDs by feature
export const ids = {
  login: {
    usernameInput: loginId('username-input'),
    passwordInput: loginId('password-input'),
  } as const,
};
```

#### `factory<K extends string>(prefix: string, opts?: { aliasPrefixes?: ReadonlyArray<string> }): IdFactory<K>`

Creates an ID factory with a specified prefix.

**Parameters:**
- `prefix`: The prefix to use for all IDs generated by this factory
- `opts.aliasPrefixes`: Optional list of other factory prefixes that intentionally share this prefix

```typescript
import { factory } from 'playwright-elements';

// Basic factory
const button = factory('btn');
button('submit');  // 'btn-submit'
button('cancel');  // 'btn-cancel'

// Typed factory
const ruleAction = factory<'rules.rowAction'>('rule-action');
ruleAction('edit');    // 'rule-action-edit' as TestId<'rules.rowAction'>
ruleAction('delete');  // 'rule-action-delete' as TestId<'rules.rowAction'>

// Factory with alias prefixes
const nudgeButton = factory('nudge-button', {
  aliasPrefixes: ['nudge-button'],
});
```

#### `bareFactory<K extends string>(): IdFactory<K>`

Creates a factory whose entire ID is the key (no prefix). Useful for
entity-based IDs where the ID itself is dynamic, such as when an ID is based on
a database ID or other unique identifier. The factory has an empty prefix.

**Note:** Incompatible with `$byTestIdPrefix`, which requires a non-empty
prefix. Use `factory()` instead if you need prefix-based selectors.

**New in v1.19.0**

```typescript
import { bareFactory, testIdProps } from 'playwright-elements';

const ruleRow = bareFactory<'rules.row'>();

// Usage in component
// <div {...testIdProps(ruleRow(ruleId))} />
// Results in: data-testid="123" (if ruleId is 123)

// The factory has an empty prefix
console.log(ruleRow.prefix);  // ''
```

#### `unsafeId(raw: string): TestId`

Adopts a string as a TestId without type safety. This is an **escape hatch** for
third-party IDs or IDs read from fixtures that cannot be statically typed.

**⚠️ Use sparingly** — prefer `sid()` or `factory()` for better type safety.

**New in v1.19.0**

```typescript
import { unsafeId, $byTestId } from 'playwright-elements';

// For third-party components with untyped test IDs
const thirdPartyId = unsafeId('external-component-id');

// Can still be used with selectors
const element = $byTestId(thirdPartyId);
```

#### `isIdFactory(v: unknown): v is IdFactory`

Type guard to check if a value is an IdFactory.

```typescript
import { isIdFactory, factory } from 'playwright-elements';

const myFactory = factory('btn');

if (isIdFactory(myFactory)) {
  console.log(myFactory.prefix);  // 'btn'
}
```

#### `assertNoPrefixCollisions(ids: Record<string, unknown>): void`

Validates that no factory prefix is a prefix of another registered ID unless
explicitly declared as an alias. This catches collision issues like
`factory('btn')` matching a static id `'btn-submit'` — a prefix selector
`[data-testid^="btn-"]` would locate both.

The check uses `prefix + '-'` to match real selector behavior, so
`factory('idx-consent')` does *not* collide with the static ID `idx-consents`
(the latter does not start with `idx-consent-`).

**New in v1.19.0**

```typescript
import { assertNoPrefixCollisions, factory, sid } from 'playwright-elements';

// Define your IDs
const ids = {
  consent: {
    button: factory<'consent.button'>('idx-consent'),
    // This WOULD collide (starts with 'idx-consent-'):
    // container: sid<'consent.container'>('idx-consent-submit'),
  },
} as const;

// Validate at module load time - throws if collisions detected
assertNoPrefixCollisions(ids);

// With alias prefixes (allows intentional collisions)
const nudgeButton = factory('nudge-button', {
  aliasPrefixes: ['nudge-button'],
});
const categoryNudge = factory('nudge-button', {
  aliasPrefixes: ['nudge-button'],
});
// This is allowed because both declare the same prefix as an alias
```

### Emission helpers

#### `testIdProps<K extends string>(id: TestId<K>, attr?: string): Record<string, string>`

Returns props to spread onto a React/JSX element to attach the `data-testid`
attribute. Honours the strip flag: returns a frozen empty object when stripping
is on. `attr` defaults to `'data-testid'`.

```typescript
import { testIdProps, sid, factory } from 'playwright-elements';

// With static ID
function MyButton() {
  return <button {...testIdProps(sid('my-button'))}>Click me</button>;
}

// With factory
const button = factory('btn');
function SubmitButton() {
  return <button {...testIdProps(button('submit'))}>Submit</button>;
}
```

#### `testIdValue<K extends string>(id: TestId<K>): string | undefined`

Returns the test ID value for bound-attribute binding styles (Angular, Vue).
Returns `undefined` when stripping is on, so the framework omits the attribute
entirely.

```typescript
import { testIdValue, sid } from 'playwright-elements';

// Angular:
// <div [attr.data-testid]="testIdValue(sid('my-id'))"></div>

// Vue:
// <div :data-testid="testIdValue(sid('my-id'))"></div>
```

### Selectors

The `$byTestId*` functions are one-line wrappers over the shared string
selector builders, so `$byTestId(id)` and `testIdSelector(id)` produce the same
CSS string from one implementation. They return `WebElement` instances and
honour the configured test ID attribute (see
[`setTestIdAttribute`](#settestidattribute--gettestidattribute)).

#### `$byTestId(id: TestId | string, attr?: string): WebElement`

Creates a WebElement that matches an element with an exact `data-testid` value.

> **Why CSS Selector Instead of `getByTestId`?**
>
> Unlike Playwright's native `page.getByTestId()`, the `$byTestId()` function
> creates a CSS attribute selector (`[data-testid="..."]`) rather than using
> Playwright's built-in test ID locator. This design decision was made for the
> following reasons:
>
> 1. **Selector String Compatibility**: Some tests pass an element's
>    `.selector` string into `page.locator()`. If `$byTestId('foo')` returned
>    the bare ID `'foo'`, then `page.locator('foo')` would incorrectly match a
>    `<foo>` HTML tag instead of the intended `[data-testid="foo"]` attribute.
> 2. **Consistency**: The CSS form `'[data-testid="foo"]'` resolves correctly
>    when passed to `page.locator()` and maintains consistency with other
>    selector types.
> 3. **Interoperability**: CSS selectors work seamlessly across all Playwright
>    methods and can be easily composed with other selectors.
>
> Note: The exact-match semantics are identical to Playwright's `getByTestId`.

```typescript
import { $byTestId, sid } from 'playwright-elements';

// With string
const button = $byTestId('submit-button');

// With TestId
const header = $byTestId(sid<'header'>('main-header'));

// Custom attribute (per-call override)
const button = $byTestId(sid('submit-button'), 'data-pw');

// Usage in page object
export const loginPage = {
  usernameField: $byTestId('username-input'),
  passwordField: $byTestId('password-input'),
  submitButton: $byTestId('submit-button'),
};
```

#### `$byTestIdPrefix(factory: IdFactory, attr?: string): WebElement`

Creates a WebElement that matches any element whose `data-testid` starts with
the factory's prefix.

```typescript
import { $byTestIdPrefix, factory } from 'playwright-elements';

// Create a factory
const ruleRow = factory<'rules.row'>('rule-row');

// Select all rule rows
const allRows = $byTestIdPrefix(ruleRow);
// Produces: $('[data-testid^="rule-row-"]')

// Usage in page object
export const rulesList = {
  allRows: $byTestIdPrefix(ruleRow),

  // Get a specific row by filtering
  getRow: (ruleId: string) => allRows.filter({ hasText: ruleId }),
};
```

**Note:** This function matches on `prefix + '-'` to match exactly what
`factory()` produces. For example, `factory('btn')` will match `'btn-submit'`
but not `'btnSubmit'` or a static id `'btntest'`. This prevents collisions with
static IDs that share the prefix.

**Note:** This function throws an error if the factory has an empty prefix
(i.e., was created with `bareFactory`).

#### `$byTestIdContaining(substring: string, attr?: string): WebElement`

Creates a WebElement that matches any element whose `data-testid` contains the
specified substring.

```typescript
import { $byTestIdContaining } from 'playwright-elements';

// Match any ID containing 'user'
const userElements = $byTestIdContaining('user');
// Produces: $('[data-testid*="user"]')
```

#### `$byTestIdEndingWith(suffix: string, attr?: string): WebElement`

Creates a WebElement that matches any element whose `data-testid` ends with the
specified suffix.

```typescript
import { $byTestIdEndingWith } from 'playwright-elements';

// Match any ID ending with '-button'
const buttons = $byTestIdEndingWith('-button');
// Produces: $('[data-testid$="-button"]')
```

#### `setTestIdAttribute` / `getTestIdAttribute`

The `$byTestId*` selectors default to `data-testid`. The attribute name is
synced automatically with your Playwright config: when you set
`use.testIdAttribute: 'data-pw'`, the `testIdAttributeBridge` fixture calls
`setTestIdAttribute('data-pw')` for you, so every `$byTestId*` call follows that
attribute without per-call arguments.

```typescript
import { setTestIdAttribute, getTestIdAttribute } from 'playwright-elements';

// Manual override (rarely needed — the fixture does this from the config):
setTestIdAttribute('data-pw');
getTestIdAttribute(); // 'data-pw'
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // The $byTestId* selectors follow this attribute automatically:
    testIdAttribute: 'data-pw',
  },
});
```

#### String selector builders

For environments without Playwright (unit tests, runtime code), the same
selectors are available as plain CSS strings. They never strip — the ID value is
identical in every mode:

```typescript
import { testIdSelector, testIdPrefixSelector, testIdContainsSelector, testIdEndsWithSelector } from 'playwright-elements';

testIdSelector(sid('submit-button'));       // '[data-testid="submit-button"]'
testIdPrefixSelector(factory('btn'));       // '[data-testid^="btn-"]'
testIdContainsSelector('user');             // '[data-testid*="user"]'
testIdEndsWithSelector('-button');          // '[data-testid$="-button"]'
```

## Complete Example

Here's a complete example showing how to use the Test IDs module in a project:

### 1. Define Your Test IDs

Create a file `testIds.ts` in your project:

```typescript
// testIds.ts
import { factory, sid, assertNoPrefixCollisions } from 'playwright-elements';

export const ids = {
  // Navigation
  nav: {
    logo: sid<'nav.logo'>('nav-logo'),
    menuButton: sid<'nav.menuButton'>('nav-menu-button'),
    item: factory<'nav.item'>('nav-item'),
  },

  // Forms
  form: {
    input: factory<'form.input'>('form-input'),
    button: factory<'form.button'>('form-button'),
    error: sid<'form.error'>('form-error-message'),
  },

  // Tables
  table: {
    row: factory<'table.row'>('table-row'),
    cell: factory<'table.cell'>('table-cell'),
    header: sid<'table.header'>('table-header'),
  },
} as const;

// Catch prefix collisions at module load time
assertNoPrefixCollisions(ids);
```

### 2. Use in Components

```tsx
// MyComponent.tsx
import { testIdProps } from 'playwright-elements';
import { ids } from './testIds';

function Navigation() {
  return (
    <nav {...testIdProps(ids.nav.logo)}>
      <button {...testIdProps(ids.nav.menuButton)}>
        Menu
      </button>
      <a {...testIdProps(ids.nav.item('/dashboard'))}>Dashboard</a>
      <a {...testIdProps(ids.nav.item('/settings'))}>Settings</a>
    </nav>
  );
}

function FormField({ name }: { name: string }) {
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <input
        id={name}
        {...testIdProps(ids.form.input(name))}
      />
    </div>
  );
}
```

### 3. Use in Page Objects

```typescript
// page-objects/navigation.page.ts
import { $byTestId, $byTestIdPrefix } from 'playwright-elements';
import { ids } from '../testIds';

export const navigation = {
  logo: $byTestId(ids.nav.logo),
  menuButton: $byTestId(ids.nav.menuButton),

  // Get all navigation items
  allItems: $byTestIdPrefix(ids.nav.item),

  // Get a specific navigation item by path
  getItem: (path: string) => $byTestId(ids.nav.item(path)),
};
```

### 4. Use in Tests

```typescript
// tests/navigation.test.ts
import { expect } from '@playwright/test';
import { navigation } from '../page-objects/navigation.page';

test('navigation works', async ({ page }) => {
  await page.goto('/');

  // Check logo is visible
  await navigation.logo.expect().toBeVisible();

  // Check all navigation items
  const items = await navigation.allItems.getAll();
  expect(items).toHaveLength(2);

  // Click on dashboard
  await navigation.getItem('/dashboard').click();

  // Verify navigation
  await expect(page).toHaveURL('/dashboard');
});
```

## Migration from String-based IDs

If you're currently using plain string IDs, here's how to migrate:

### Before

```typescript
// Components
<button data-testid="submit-button">Submit</button>

// Tests
const button = page.getByTestId('submit-button');
```

### After

```typescript
// testIds.ts
import { sid } from 'playwright-elements';

export const ids = {
  buttons: {
    submit: sid<'buttons.submit'>('submit-button'),
  },
} as const;

// Components
import { testIdProps } from 'playwright-elements';
import { ids } from './testIds';

<button {...testIdProps(ids.buttons.submit)}>Submit</button>

// Tests
import { $byTestId } from 'playwright-elements';
import { ids } from './testIds';

const button = $byTestId(ids.buttons.submit);
```

## Best Practices

1. **Centralize ID Definitions**: Keep all test ID definitions in a single
   file or a dedicated module (e.g., `testIds.ts` or `testIds/` directory).

2. **Use Type Parameters**: Always provide explicit type parameters for better
   type safety:
   ```typescript
   // Good
   const button = sid<'main.button'>('main-button');

   // Less good (loses type specificity)
   const button = sid('main-button');
   ```

3. **Organize by Feature**: Group related IDs together in your registry:
   ```typescript
   export const ids = {
     auth: {
       loginButton: sid<'auth.loginButton'>('login-button'),
       logoutButton: sid<'auth.logoutButton'>('logout-button'),
     },
     dashboard: {
       // ...
     },
   } as const;
   ```

4. **Use Factories for Dynamic IDs**: When you have multiple similar elements
   (e.g., list items, table rows), use factories:
   ```typescript
   const listItem = factory<'list.item'>('list-item');

   // In component
   <li {...testIdProps(listItem(item.id))} />

   // In test
   const allItems = $byTestIdPrefix(listItem);
   ```

5. **Avoid String Literals**: Never write `data-testid` strings directly in
   your components or tests. Always use the centralized IDs.

6. **Test Your IDs**: Consider adding tests to verify that all IDs in your
   registry are unique and follow your naming conventions.

## TypeScript Configuration

For optimal type checking with branded types, ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Enforcing Test IDs with Git Hooks

Type safety stops you from mixing IDs at compile time, but it cannot force an
engineer to add a test ID to a new component in the first place. A component
without a test ID is invisible to `$byTestId` and degrades the testability of
the whole frontend. To keep the registry complete, wire a **pre-commit hook**
that scans staged component files and rejects the commit when an interactive
element is missing a test ID.

The setup below uses [husky](https://typicode.github.io/husky/) (already a
devDependency of `playwright-elements`) and a small shell script. It checks
staged `.tsx`/`.jsx`/`.vue` files and fails when a file contains an interactive
element (`<button`, `<input`, `<a `, `<select`, ...) but no test ID stamp
(`testIdProps(` or `data-testid=`).

### 1. The check script

Create `scripts/check-test-ids.sh`:

```bash
#!/bin/bash
# Pre-commit guard: every staged component file must stamp a test ID.
# Fails the commit when an interactive element is missing testIdProps()
# or a data-testid attribute.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Interactive elements that must be queryable by $byTestId.
INTERACTIVE_PATTERN='<(button|input|a |select|textarea|form )[ >]'

# Files considered "components".
COMPONENT_GLOB='*.tsx *.jsx *.vue *.svelte'

# Staged component files only.
STAGED=$(git diff --cached --name-only --diff-filter=ACMR -- "$COMPONENT_GLOB")

if [ -z "$STAGED" ]; then
  exit 0
fi

ISSUES=0

for file in $STAGED; do
  [ -f "$file" ] || continue

  # Does the file contain any interactive element?
  if ! grep -Eq "$INTERACTIVE_PATTERN" "$file"; then
    continue
  fi

  # Does it stamp a test ID anywhere?
  if grep -Eq 'testIdProps\(|data-testid=|testIdValue\(' "$file"; then
    continue
  fi

  echo -e "${RED}❌ $file${NC}"
  echo -e "  ${YELLOW}interactive element found but no test ID stamp${NC}"
  echo -e "  ${YELLOW}add {...testIdProps(ids....)} or data-testid=\"...\"${NC}"
  ISSUES=$((ISSUES + 1))
done

if [ "$ISSUES" -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ $ISSUES component(s) missing test IDs${NC}"
  echo ""
  echo "Components without a data-testid are invisible to \$byTestId and"
  echo "cannot be located in e2e tests. Add a test ID from your registry:"
  echo "  import { testIdProps } from 'playwright-elements';"
  echo "  <button {...testIdProps(ids.login.submit)}>Submit</button>"
  echo ""
  echo "See docs/test_ids.html for the full guide."
  exit 1
fi

echo -e "${GREEN}✅ all staged components have test IDs${NC}"
```

Make it executable:

```bash
chmod +x scripts/check-test-ids.sh
```

### 2. The husky pre-commit hook

Install husky and create the hook:

```bash
npm install -D husky
npx husky install
npx husky add .husky/pre-commit "npm run check:testids"
chmod +x .husky/pre-commit
```

Wire the script into `package.json` and call it from the hook. Edit
`.husky/pre-commit` to match the existing hook style:

```sh
#!/bin/sh
. "$(dirname -- "$0")/_/husky.sh"

npm run check:testids
```

Add the npm script:

```json
{
  "scripts": {
    "check:testids": "./scripts/check-test-ids.sh"
  }
}
```

Now a commit that adds a `<button>` without a test ID is rejected locally:

```text
❌ src/components/PayButton.tsx
  interactive element found but no test ID stamp
  add {...testIdProps(ids....)} or data-testid="..."

❌ 1 component(s) missing test IDs
```

### 3. Stricter per-element enforcement (optional)

The file-level check above is cheap and catches the common case (a component
file with no test ID at all). For a stricter per-element check, run a small
Node script over the staged files that parses each interactive element and
requires a `testIdProps(...)` spread or `data-testid` attribute on it. The
single source of truth for selectors (`$byTestId(id) === $(testIdSelector(id))`)
means any ID your registry produces is guaranteed to be locatable — the guard
only needs to ensure the stamp exists.

A minimal Node implementation:

```javascript
// scripts/check-test-ids.mjs
import { readFileSync } from 'node:fs';

const INTERACTIVE = /<(button|input|a|select|textarea|form)\b[^>]*>/g;
const HAS_ID = /testIdProps\(|data-testid\s*=|testIdValue\(/;

let issues = 0;
const files = process.argv.slice(2);

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const match of src.matchAll(INTERACTIVE)) {
    const tag = match[0];
    if (!HAS_ID.test(tag)) {
      console.error(`❌ ${file}: <${match[1]}> without test ID`);
      console.error(`   ${tag.split('\n')[0].slice(0, 120)}`);
      issues++;
    }
  }
}

if (issues > 0) {
  console.error(`\n${issues} element(s) missing test IDs`);
  process.exit(1);
}
```

Drive it from the hook over staged files:

```sh
#!/bin/sh
. "$(dirname -- "$0")/_/husky.sh"

STAGED=$(git diff --cached --name-only --diff-filter=ACMR -- '*.tsx' '*.jsx' '*.vue')
[ -n "$STAGED" ] && node scripts/check-test-ids.mjs $STAGED
```

### What this guarantees

| Layer | What it enforces |
| --- | --- |
| **TypeScript** (`TestId<K>`) | You cannot mix an `auth.username` ID with a `nav.link` ID |
| **`assertNoPrefixCollisions`** | Factory prefixes do not accidentally match static IDs |
| **Pre-commit hook** | Every new interactive component carries a test ID |
| **Production stripping** | The IDs you added never ship to production |

Together they make the testability of the frontend a first-class, enforced
property rather than a convention — the registry is complete, type-checked,
collision-free, and stripped from the production artifact.

## See Also

- [WebElement API](web_element.md) - The core WebElement class
- [Best Practices](best_practices.md) - Recommended patterns and tips
- [Migration Guide](migration_guide.md) - Migrating from previous versions
