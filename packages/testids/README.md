# @playwright-elements/testids

Zero-dependency, type-safe test ID generation for Playwright and beyond.

## Why?

This package provides the test ID builder utilities extracted from
`playwright-elements` as a standalone package with **zero runtime dependencies**.
Install it in production code (React components, shared ID registries) or in
unit tests without pulling Playwright, lodash, or any browser stack.

It is the equivalent of installing a single lodash submodule — only what you
need, nothing more.

## Installation

```bash
npm install -D @playwright-elements/testids
```

## Usage

```typescript
import { sid, factory, bareFactory, ns, testIdProps, assertNoPrefixCollisions } from '@playwright-elements/testids';
import type { TestId, IdFactory } from '@playwright-elements/testids';

// Static IDs
const submitButton = sid('submit-button');           // 'submit-button'
const userProfile  = sid('user', 'profile', 'link');  // 'user-profile-link'

// Typed IDs (branded types prevent mixing categories at compile time)
const headerId: TestId<'header'> = sid('header-title');

// Factory for prefixed dynamic IDs
const button = factory<'button'>('btn');
button('submit');  // 'btn-submit'  as TestId<'button'>
button.prefix;     // 'btn'

// Namespace helper
const loginId = ns<'login'>();
loginId('username-input');  // TestId<'login'>

// React / JSX spread
function MyComponent() {
  return <button {...testIdProps(submitButton)}>Click me</button>;
}

// Collision check at module load time
const ids = { submit: sid('submit'), btn: factory('btn') } as const;
assertNoPrefixCollisions(ids);
```

## Backward compatibility

The `playwright-elements/testids` subpath still works — it re-exports this
package. Existing imports do not need to change. Use this package directly
when you want install-time isolation (no Playwright or lodash in
`node_modules`).

## API

See the [full Test IDs documentation](https://danteukraine.github.io/playwright-elements/test_ids) for the complete API reference.
