# @playwright-elements/testids

[![npm version](https://img.shields.io/npm/v/@playwright-elements/testids.svg)](https://www.npmjs.com/package/@playwright-elements/testids)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> Zero-dependency, type-safe **test ID generation** and **production stripping** for Playwright and beyond.

`@playwright-elements/testids` is a standalone toolkit extracted from
[`playwright-elements`](https://github.com/DanteUkraine/playwright-elements). It
gives you a single, shared source of truth for every `data-testid` value in your
application — the same registry that stamps attributes in your components is the
one your tests query against — with **compile-time type safety** and
**build-time removal of test IDs from production bundles**.

It has **zero runtime dependencies**. Install it in production application code
(React/Vue/Angular components, shared ID registries) or in unit tests without
pulling Playwright, lodash, or any browser automation stack into `node_modules`.

---

## Table of contents

- [Why this exists](#why-this-exists)
- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [The model in one minute](#the-model-in-one-minute)
- [Core concepts](#core-concepts)
  - [The `TestId` branded type](#the-testid-branded-type)
  - [The `IdFactory`](#the-idfactory)
  - [The strippable attribute](#the-strippable-attribute)
- [Production stripping](#production-stripping)
  - [How the decision is made](#how-the-decision-is-made)
  - [Why standard transforms cannot strip the spread form](#why-standard-transforms-cannot-strip-the-spread-form)
  - [Emission helpers](#emission-helpers)
  - [Verifying stripping](#verifying-stripping)
- [API reference](#api-reference)
  - [Entry points](#entry-points)
  - [ID builders](#id-builders)
  - [Emission helpers](#emission-helpers-1)
  - [Strippable attributes](#strippable-attributes)
  - [Selectors](#selectors)
- [Framework integration](#framework-integration)
- [Complete example](#complete-example)
- [Best practices](#best-practices)
- [Migration from string-based IDs](#migration-from-string-based-ids)
- [TypeScript configuration](#typescript-configuration)
- [Relationship to `playwright-elements`](#relationship-to-playwright-elements)
- [License](#license)

---

## Why this exists

Plain string test IDs (`data-testid="submit-button"`) are brittle: they are
duplicated between application code and tests, drift apart silently, resist
refactoring, and offer no IDE support. This package replaces them with a
**typed registry** where every ID exists in exactly one place, is checked by the
compiler, and is removed from production automatically.

Three concerns are kept separate and explicit:

| Concern | Responsibility | Tools |
| --- | --- | --- |
| **Build** an ID value | Produce a stable, collision-resistant string | `sid`, `factory`, `bareFactory`, `ns`, `unsafeId` |
| **Emit** an attribute | Stamp `data-testid` onto the DOM (or not) | `testIdProps`, `testIdValue`, `createStrippableAttribute` |
| **Read** an attribute | Build a CSS selector that matches the ID | `testIdSelector`, `testIdPrefixSelector`, ... |

The read side never strips: the ID *value* is identical in every build mode, so
a unit test (jsdom), a runtime query, and an e2e spec can all share one selector
builder.

## Features

- **Type-safe IDs** — a branded `TestId<K>` type stops you from mixing an
  `auth.username` ID with a `nav.link` ID at compile time, while plain strings
  are still rejected.
- **Factories for dynamic IDs** — `factory('btn')` produces `btn-submit`,
  `btn-cancel`, ... and exposes its `.prefix` for prefix selectors.
- **Collision detection at load time** — `assertNoPrefixCollisions()` throws if
  a factory prefix would accidentally match a static ID (e.g. `idx-consent`
  matching `idx-consents`).
- **Production stripping** — `data-testid` attributes are removed from
  production builds via a build-time-foldable flag, *including* the spread form
  that standard React transforms cannot strip.
- **Universal strippable primitive** — `createStrippableAttribute('data-qa')`
  gives the same emit/strip machinery to any attribute, not just `data-testid`.
- **Zero-dependency selectors** — `testIdSelector(id)` returns the CSS string
  `[data-testid="..."]` with no Playwright installed; works in jsdom, vitest, and
  runtime code.
- **Zero runtime dependencies** — no Playwright, no lodash, no browser stack.

## Installation

```bash
npm install -D @playwright-elements/testids
```

Because there are no runtime dependencies, it is also safe to install as a
production dependency when your application components import it directly:

```bash
npm install @playwright-elements/testids
```

## Quick start

```typescript
import {
  sid, factory, bareFactory, ns, unsafeId,
  testIdProps, testIdValue,
  assertNoPrefixCollisions,
  testIdSelector, testIdPrefixSelector,
  createStrippableAttribute,
} from '@playwright-elements/testids';
import type { TestId, IdFactory } from '@playwright-elements/testids';

// 1. Define a single registry of IDs.
const ids = {
  nav: {
    logo: sid<'nav.logo'>('nav-logo'),
    item: factory<'nav.item'>('nav-item'),
  },
  form: {
    username: sid<'form.username'>('username-input'),
    submit: sid<'form.submit'>('submit-button'),
  },
  ruleRow: bareFactory<'rules.row'>(),
} as const;

// 2. Catch prefix collisions at module load time.
assertNoPrefixCollisions(ids);

// 3. Stamp attributes in components (stripped in production builds).
//    React / JSX spread:
<button {...testIdProps(ids.form.submit)}>Submit</button>
//    Angular / Vue bound form:
//    <div [attr.data-testid]="testIdValue(ids.form.username)"></div>

// 4. Query in any environment (no Playwright needed).
container.querySelector(testIdSelector(ids.form.submit));
// -> container.querySelector('[data-testid="submit-button"]')

container.querySelectorAll(testIdPrefixSelector(ids.nav.item));
// -> container.querySelectorAll('[data-testid^="nav-item-"]')
```

## The model in one minute

```
            build                          emit                          read
   sid('submit-button')          testIdProps(id)            testIdSelector(id)
   factory('btn')('submit')  -->  { 'data-testid': id }  -->  '[data-testid="..."]'
   bareFactory()(123)            or frozen {} (stripped)    (never stripped)
```

- **Build** produces a `TestId` (a branded string). The value is stable and
  mode-independent.
- **Emit** decides whether the attribute reaches the DOM. When stripping is on,
  `testIdProps()` returns a frozen empty object and `testIdValue()` returns
  `undefined`, so the attribute is absent — not merely empty.
- **Read** always produces the same CSS selector string, regardless of mode.

---

## Core concepts

### The `TestId` branded type

`TestId<K>` is a branded `string`. The brand (`__testIdBrand: 'pe/testids'`) is
**structural**, so two installed copies of this package produce interoperable
types — a realistic hoisting outcome. The optional `Kind` parameter gives
light category grouping and IDE autocompletion; it is **covariant**, so
`TestId<'button'>` is assignable to `TestId<string>` but not vice versa. Plain
strings are rejected because they lack the brand.

```typescript
import { sid, type TestId } from '@playwright-elements/testids';

type ButtonId = TestId<'button'>;
type ContainerId = TestId<'container'>;

const submit: ButtonId = sid('submit-button');
const main: ContainerId = sid('main-container');

// Type error: cannot assign ContainerId to ButtonId.
// const wrong: ButtonId = main;

// The Kind parameter is optional — omit it when you don't need per-id typing.
const simple = sid('submit-button'); // TestId<string>
```

### The `IdFactory`

An `IdFactory` generates IDs with a consistent prefix and exposes its `.prefix`
for prefix-based selectors without duplicating the prefix string.

```typescript
import { factory, type IdFactory } from '@playwright-elements/testids';

const button = factory<'button'>('btn');

button('submit'); // 'btn-submit' as TestId<'button'>
button('cancel'); // 'btn-cancel' as TestId<'button'>
button.prefix;    // 'btn'
```

### The strippable attribute

A `StrippableAttribute` bundles the emit/read pair for one HTML attribute. The
canonical instance for `data-testid` is exported as `testIds`; build your own
with `createStrippableAttribute('data-qa')` for custom attributes.

```typescript
import { testIds, createStrippableAttribute } from '@playwright-elements/testids';

testIds.attribute;          // 'data-testid'
testIds.enabled;            // true in dev/test, false in a stripped prod build
testIds.props(sid('x'));     // { 'data-testid': 'x' } or frozen {}
testIds.value(sid('x'));     // 'x' or undefined
testIds.selector(sid('x'));  // '[data-testid="x"]'  (never stripped)
```

---

## Production stripping

Test IDs are a development-time concern. This module removes `data-testid`
attributes from production builds automatically — no manual cleanup, and
crucially, no reliance on React attribute-stripping transforms.

### How the decision is made

The strip decision is a single module constant, resolved once at import time and
written as literal `process.env` references so that bundlers (webpack
DefinePlugin, Vite `define`, esbuild `--define`) replace them at build time and
eliminate the dead branch entirely.

| `NODE_ENV` | `PE_TESTIDS` | Result |
| --- | --- | --- |
| anything but `production` | unset | **emit** (ids present in dev/test) |
| `production` | unset | **strip** |
| `production` | `on` | **emit** (prod build *with* ids, for an e2e lane) |
| non-production | `off` | **strip** (force strip in dev) |

```bash
# Production build (ids stripped):
NODE_ENV=production npm run build

# Production build WITH ids (validate the shipped artifact in an e2e lane):
PE_TESTIDS=on NODE_ENV=production npm run build
```

The default is **emit**: only an explicit production signal disables. The
`PE_TESTIDS` override works in *both* directions, independently of `NODE_ENV`.

### Why standard transforms cannot strip the spread form

`compiler.reactRemoveProperties` and `babel-plugin-react-remove-properties`
match `JSXAttribute` by name. A `JSXSpreadAttribute` has no name, so the literal
attribute is removed but the spread survives — silently shipping IDs to
production:

```tsx
// The literal data-testid is removed, but the spread survives:
<div data-testid="literal" {...testIdProps(ids.foo)}>x</div>
```

This module strips *inside* `testIdProps()`. When stripping is on,
`testIdProps()` returns a frozen empty object, so spreading is a no-op and the
attribute never reaches the DOM. A single frozen instance is shared by every
stripped stamp, so stripping allocates nothing per render and cannot be mutated
by a caller.

### Emission helpers

Two binding styles are supported:

```typescript
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

Both helpers accept an optional attribute name to match a custom Playwright
`use.testIdAttribute` config:

```tsx
<div {...testIdProps(sid('my-button'), 'data-pw')} />
```

### Verifying stripping

**Mode assertion** — cheap, runs in any unit lane:

```typescript
import { testIds } from '@playwright-elements/testids';

it('emits ids in dev and test', () => {
  expect(testIds.enabled).toBe(true);
  expect(testIds.props(sid('submit'))).toEqual({ 'data-testid': 'submit' });
});
```

**Artifact assertion** — reads the built output:

```bash
# Must find nothing:
NODE_ENV=production npm run build
grep -r 'data-testid' <build output dir> && echo "FAIL: ids in prod build" || echo "OK"

# Override must put them back:
PE_TESTIDS=on NODE_ENV=production npm run build
grep -rq 'data-testid' <build output dir> && echo "OK" || echo "FAIL"
```

---

## API reference

### Entry points

| Import path | Contents |
| --- | --- |
| `@playwright-elements/testids` | Everything (re-exports builder + strippable + selectors) |
| `@playwright-elements/testids/builder` | ID builders and emission helpers only |
| `@playwright-elements/testids/strippable` | `createStrippableAttribute`, `testIds`, `createTestIds`, `TEST_IDS_ENABLED`, `quote` |
| `@playwright-elements/testids/selectors` | Zero-dependency string selector builders |

### ID builders

#### `sid<K extends string = string>(...parts: Array<string | number>): TestId<K>`

Builds a static ID from one or more kebab-case parts, joined with `-`. Empty and
nullish parts are filtered; the first part must be a non-empty string.

```typescript
sid('submit-button');              // 'submit-button'
sid('user', 'profile', 'link');    // 'user-profile-link'
const header: TestId<'header'> = sid('header-title');
```

#### `ns<K extends string>(): (part: string | number) => TestId<K>`

Creates a namespaced helper that fixes the `Kind` for every ID it builds — a
convenience for grouping IDs by feature.

```typescript
const loginId = ns<'login'>();
loginId('username-input'); // TestId<'login'>
loginId('password-input'); // TestId<'login'>
```

#### `factory<K extends string = string>(prefix: string, opts?: { aliasPrefixes?: ReadonlyArray<string> }): IdFactory<K>`

Creates a factory that prefixes every generated ID with `prefix-`. The factory
exposes `.prefix` and the optional `.aliasPrefixes` used by collision checks.

```typescript
const button = factory<'button'>('btn');
button('submit'); // 'btn-submit'
button('cancel'); // 'btn-cancel'
button.prefix;    // 'btn'

// Typed factory:
const ruleAction = factory<'rules.rowAction'>('rule-action');
ruleAction('edit'); // 'rule-action-edit' as TestId<'rules.rowAction'>
```

`aliasPrefixes` declares other prefixes that intentionally collide, so
`assertNoPrefixCollisions` allows them:

```typescript
const rowNudge = factory('nudge-button', { aliasPrefixes: ['nudge-button'] });
const catNudge = factory('nudge-button', { aliasPrefixes: ['nudge-button'] });
```

#### `bareFactory<K extends string = string>(): IdFactory<K>`

Creates a factory whose entire ID is the key (no prefix, empty `.prefix`). Use
it for entity-based IDs such as database IDs. It is incompatible with
`testIdPrefixSelector`, which requires a non-empty prefix — use `factory()`
instead if you need prefix-based selectors. Unlike `factory()`, `bareFactory()`
accepts falsy-but-valid keys like `0`.

```typescript
const ruleRow = bareFactory<'rules.row'>();
<div {...testIdProps(ruleRow(ruleId))} />
// data-testid="123" when ruleId is 123
ruleRow.prefix; // ''
```

#### `unsafeId(raw: string): TestId`

Adopts an arbitrary string as a `TestId` without type safety. This is an escape
hatch for third-party IDs or IDs read from fixtures that cannot be statically
typed. Use sparingly — prefer `sid()` or `factory()`.

```typescript
const thirdPartyId = unsafeId('external-component-id');
testIdSelector(thirdPartyId); // '[data-testid="external-component-id"]'
```

#### `isIdFactory(v: unknown): v is IdFactory`

Type guard used by consistency checks. Returns `true` when `v` is a function
with a string `.prefix`.

#### `assertNoPrefixCollisions(ids: Record<string, unknown>): void`

Walks an ID registry (nested arbitrarily deep) and throws if any factory prefix
is a prefix of another registered ID, unless declared as an alias. The check
uses `prefix + '-'` to match real selector behavior, so `factory('idx-consent')`
does *not* collide with the static ID `idx-consents` (the latter does not start
with `idx-consent-`), while `factory('btn')` *does* collide with `btn-submit`.

```typescript
const ids = {
  consent: {
    button: factory<'consent.button'>('idx-consent'),
    // This WOULD collide (starts with 'idx-consent-'):
    // container: sid<'consent.container'>('idx-consent-submit'),
  },
} as const;

assertNoPrefixCollisions(ids); // throws on collision
```

### Emission helpers

#### `testIdProps<K extends string>(id: TestId<K>, attr?: string): Record<string, string>`

Returns props to spread onto a JSX element. Honours the strip flag: returns a
frozen empty object when stripping is on. `attr` defaults to `'data-testid'`.

```tsx
<button {...testIdProps(sid('my-button'))}>Click me</button>
<div {...testIdProps(sid('my-button'), 'data-pw')} />
```

#### `testIdValue<K extends string>(id: TestId<K>): string | undefined`

Returns the ID string for bound-attribute binding styles (Angular `[attr...]`,
Vue `:attr`). Returns `undefined` when stripping is on, so the framework omits
the attribute entirely.

```html
<!-- Angular -->
<div [attr.data-testid]="testIdValue(sid('my-id'))"></div>
<!-- Vue -->
<div :data-testid="testIdValue(sid('my-id'))"></div>
```

### Strippable attributes

#### `createStrippableAttribute<Name extends string = string>(attribute: string, options?: { enabled?: boolean }): StrippableAttribute<Name>`

The universal primitive behind `data-testid` stripping. Returns a handler for
one HTML attribute with the following surface:

| Member | Description |
| --- | --- |
| `attribute: string` | The attribute name, e.g. `'data-testid'` |
| `enabled: boolean` | The active mode (assertable in tests) |
| `props(id)` | `{ [attr]: id }` when enabled, frozen `{}` when stripped |
| `value(id)` | `id` when enabled, `undefined` when stripped |
| `selector(id)` | `[attr="id"]` — **never strips** |
| `prefixSelector(factory)` | `[attr^="prefix-"]`; throws on empty prefix |
| `containsSelector(fragment)` | `[attr*="fragment"]` |
| `endsWithSelector(suffix)` | `[attr$="suffix"]` |
| `anySelector()` | `[attr]` — matches any value |

`options.enabled` overrides the global flag: `true` for an attribute that must
never be stripped (e.g. read by production CSS), `false` for always-strip, omit
to follow the global `TEST_IDS_ENABLED`.

```typescript
import { createStrippableAttribute, sid } from '@playwright-elements/testids';

// Canonical instance for data-testid (follows the global flag):
const testIds = createStrippableAttribute('data-testid');

// Never strip (read by production CSS):
const sectionKind = createStrippableAttribute('data-section-kind', { enabled: true });
sectionKind.props(sid('hero')); // { 'data-section-kind': 'hero' } — always emitted

// Custom attribute that follows the global flag:
const qaIds = createStrippableAttribute('data-qa');
qaIds.props(sid('submit')); // { 'data-qa': 'submit' } or {}
```

#### `testIds: StrippableAttribute<string>`

The canonical strippable attribute for `data-testid`. This is the instance the
top-level `testIdSelector` helpers read from.

#### `createTestIds(options: { attribute: string; enabled?: boolean }): StrippableAttribute`

Factory for a configurable attribute name without global mutable state. Each
call produces an isolated instance with no order-of-import hazard.

```typescript
const myIds = createTestIds({ attribute: 'data-pw' });
myIds.props(sid('submit'));    // { 'data-pw': 'submit' } or {}
myIds.selector(sid('submit')); // '[data-pw="submit"]'
myIds.value(sid('submit'));    // 'submit' or undefined
```

#### `TEST_IDS_ENABLED: boolean`

The resolved strip flag, exposed so consumers can assert on it.

#### `quote(value: string): string`

Quotes a value for a CSS attribute selector, escaping backslashes and
double-quotes, then wrapping in double quotes. Useful when building custom
selectors.

### Selectors

These functions return CSS attribute selector **strings**. They have no
Playwright dependency and never strip — the ID value is identical in every mode,
which is what lets a unit test, a runtime query, and an e2e spec share one
selector builder. Each accepts an optional `attr` to target a custom attribute.

#### `testIdSelector(id: TestId | string, attr?: string): string`

Exact match.

```typescript
testIdSelector(sid('submit-button')); // '[data-testid="submit-button"]'
testIdSelector('submit', 'data-pw');  // '[data-pw="submit"]'
```

#### `testIdPrefixSelector(factory: IdFactory, attr?: string): string`

Matches any ID produced by a factory. Uses `prefix + '-'` so `factory('btn')`
matches `btn-submit` but not a static ID `btntest`. Throws if the factory has an
empty prefix (i.e. was created with `bareFactory`).

```typescript
const btn = factory('btn');
testIdPrefixSelector(btn); // '[data-testid^="btn-"]'
```

#### `testIdContainsSelector(fragment: string, attr?: string): string`

Matches any ID containing a substring.

```typescript
testIdContainsSelector('user'); // '[data-testid*="user"]'
```

#### `testIdEndsWithSelector(suffix: string, attr?: string): string`

Matches any ID ending with a suffix.

```typescript
testIdEndsWithSelector('-button'); // '[data-testid$="-button"]'
```

---

## Framework integration

The emission helpers are framework-agnostic — they only produce objects/values,
so they work anywhere attributes are bound.

**React / Preact / Solid (spread):**

```tsx
<button {...testIdProps(ids.form.submit)}>Submit</button>
```

**Svelte / Vue `v-bind` (spread):**

```svelte
<button {...testIdProps(ids.form.submit)}>Submit</button>
```

**Vue `:attr` (bound):**

```html
<div :data-testid="testIdValue(ids.form.username)"></div>
```

**Angular (bound):**

```html
<div [attr.data-testid]="testIdValue(ids.form.username)"></div>
```

**Custom attribute** (matches Playwright's `use.testIdAttribute: 'data-pw'`):

```tsx
<button {...testIdProps(ids.form.submit, 'data-pw')}>Submit</button>
```

---

## Complete example

### 1. Define your IDs in one registry

```typescript
// testIds.ts
import { factory, sid, assertNoPrefixCollisions } from '@playwright-elements/testids';

export const ids = {
  nav: {
    logo: sid<'nav.logo'>('nav-logo'),
    menuButton: sid<'nav.menuButton'>('nav-menu-button'),
    item: factory<'nav.item'>('nav-item'),
  },
  form: {
    input: factory<'form.input'>('form-input'),
    button: factory<'form.button'>('form-button'),
    error: sid<'form.error'>('form-error-message'),
  },
  table: {
    row: factory<'table.row'>('table-row'),
    cell: factory<'table.cell'>('table-cell'),
    header: sid<'table.header'>('table-header'),
  },
} as const;

assertNoPrefixCollisions(ids);
```

### 2. Use in components

```tsx
// MyComponent.tsx
import { testIdProps } from '@playwright-elements/testids';
import { ids } from './testIds';

function Navigation() {
  return (
    <nav {...testIdProps(ids.nav.logo)}>
      <button {...testIdProps(ids.nav.menuButton)}>Menu</button>
      <a {...testIdProps(ids.nav.item('/dashboard'))}>Dashboard</a>
      <a {...testIdProps(ids.nav.item('/settings'))}>Settings</a>
    </nav>
  );
}

function FormField({ name }: { name: string }) {
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <input id={name} {...testIdProps(ids.form.input(name))} />
    </div>
  );
}
```

### 3. Query in tests (no Playwright required)

```typescript
// form.spec.ts (vitest + jsdom)
import { testIdSelector, testIdPrefixSelector } from '@playwright-elements/testids';
import { ids } from './testIds';

test('form stamps ids', () => {
  const stamp = (p: Record<string, string>) =>
    Object.entries(p).map(([k, v]) => `${k}="${v}"`).join(' ');

  document.body.innerHTML = `
    <form>
      <input ${stamp(testIdProps(ids.form.input('email')))} />
      <button ${stamp(testIdProps(ids.form.button('submit')))}>Submit</button>
    </form>`;

  const input = document.querySelector(testIdSelector(ids.form.input('email')));
  expect(input).not.toBeNull();

  const allInputs = document.querySelectorAll(testIdPrefixSelector(ids.form.input));
  expect(allInputs.length).toBeGreaterThan(0);
});
```

### 4. Query in Playwright e2e

The same selector strings work directly with Playwright's `page.locator()`:

```typescript
// e2e/navigation.spec.ts
import { testIdSelector, testIdPrefixSelector } from '@playwright-elements/testids';
import { ids } from './testIds';

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.locator(testIdSelector(ids.nav.menuButton)).click();
  const items = page.locator(testIdPrefixSelector(ids.nav.item));
  await expect(items).toHaveCount(2);
  await page.locator(testIdSelector(ids.nav.item('/dashboard'))).click();
  await expect(page).toHaveURL('/dashboard');
});
```

For the higher-level, Playwright-bound selectors (`$byTestId`,
`$byTestIdPrefix`, ...) that return `WebElement` instances, install the full
[`playwright-elements`](https://www.npmjs.com/package/playwright-elements)
package — see [Relationship to `playwright-elements`](#relationship-to-playwright-elements).

---

## Best practices

1. **Centralize ID definitions.** Keep all IDs in a single module
   (`testIds.ts` or a `testIds/` directory). One source of truth is the whole
   point.
2. **Provide explicit type parameters** when you want category grouping and
   autocompletion. Omit `Kind` when you don't — it defaults to `string`.
   ```typescript
   const button = sid<'main.button'>('main-button'); // typed
   const simple = sid('main-button');                // TestId<string>
   ```
3. **Organize by feature** in your registry:
   ```typescript
   export const ids = {
     auth: { loginButton: sid<'auth.loginButton'>('login-button') },
     dashboard: { /* ... */ },
   } as const;
   ```
4. **Use factories for dynamic IDs** (list items, table rows):
   ```typescript
   const listItem = factory<'list.item'>('list-item');
   // component: <li {...testIdProps(listItem(item.id))} />
   // test:      testIdPrefixSelector(listItem)
   ```
5. **Never write `data-testid` string literals** in components or tests. Always
   go through the registry.
6. **Call `assertNoPrefixCollisions(ids)` at module load time** to catch prefix
   overlaps before they reach CI.
7. **Verify stripping in CI** with an artifact assertion grep against the build
   output (see [Verifying stripping](#verifying-stripping)).

## Migration from string-based IDs

### Before

```tsx
// Component
<button data-testid="submit-button">Submit</button>

// Test
const button = page.getByTestId('submit-button');
```

### After

```typescript
// testIds.ts
import { sid } from '@playwright-elements/testids';

export const ids = {
  buttons: {
    submit: sid<'buttons.submit'>('submit-button'),
  },
} as const;
```

```tsx
// Component
import { testIdProps } from '@playwright-elements/testids';
import { ids } from './testIds';

<button {...testIdProps(ids.buttons.submit)}>Submit</button>
```

```typescript
// Test
import { testIdSelector } from '@playwright-elements/testids';
import { ids } from './testIds';

page.locator(testIdSelector(ids.buttons.submit));
```

## TypeScript configuration

For optimal type checking with branded types, ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Relationship to `playwright-elements`

`@playwright-elements/testids` is the zero-dependency core of the test ID system
in [`playwright-elements`](https://github.com/DanteUkraine/playwright-elements).
Two ways to consume it:

| Option | Install | Imports | What you get |
| --- | --- | --- | --- |
| **Standalone package** (recommended for app code and unit tests) | `npm i @playwright-elements/testids` | `from '@playwright-elements/testids'` | Zero runtime dependencies — no Playwright, no lodash in `node_modules` |
| **Subpath re-export** (backward compatible) | `npm i playwright-elements` | `from 'playwright-elements/testids'` | Zero *import-time* dependencies, but installs the full package |

The `playwright-elements/testids` subpath re-exports this package, so existing
imports do not need to change.

The standalone package provides **string selector builders**
(`testIdSelector`, `testIdPrefixSelector`, ...) that return CSS strings and
work with `page.locator()`. The Playwright-bound selectors that return
`WebElement` instances — `$byTestId`, `$byTestIdPrefix`, `$byTestIdContaining`,
`$byTestIdEndingWith` — live in the full `playwright-elements` package, which
also adds component hierarchies, page objects, and fixtures.

Full project documentation: <https://danteukraine.github.io/playwright-elements>

## License

[MIT](./LICENSE) — Oleksandr Solomin
