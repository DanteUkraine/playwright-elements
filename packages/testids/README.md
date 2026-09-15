# @playwright-elements/testids

Zero-dependency, type-safe test ID generation for Playwright and beyond.

## Why?

This package provides the test ID builder utilities extracted from
`playwright-elements` as a standalone package with **zero runtime dependencies**.
Install it in production code (React components, shared ID registries) or in
unit tests without pulling Playwright, lodash, or any browser stack.

It also provides **production stripping**: test IDs are automatically removed
from production builds via a build-time-foldable flag.

## Installation

```bash
npm install -D @playwright-elements/testids
```

## Usage

```typescript
import { sid, factory, bareFactory, ns, testIdProps, testIdValue, assertNoPrefixCollisions } from '@playwright-elements/testids';
import type { TestId, IdFactory } from '@playwright-elements/testids';

// Static IDs
const submitButton = sid('submit-button');           // 'submit-button'
const userProfile  = sid('user', 'profile', 'link');  // 'user-profile-link'

// Factory for prefixed dynamic IDs
const button = factory('btn');
button('submit');  // 'btn-submit'
button.prefix;     // 'btn'

// React / JSX spread (stripped in production builds):
<button {...testIdProps(submitButton)}>Click me</button>

// Angular / Vue bound form (stripped in production builds):
// <div [attr.data-testid]="testIdValue(submitButton)"></div>

// Zero-dep string selectors (NO Playwright needed):
import { testIdSelector } from '@playwright-elements/testids';
container.querySelector(testIdSelector(submitButton));
// -> container.querySelector('[data-testid="submit-button"]')

// Universal strippable primitive for any attribute:
import { createStrippableAttribute } from '@playwright-elements/testids';
const qaIds = createStrippableAttribute('data-qa');
qaIds.props(sid('submit'));  // { 'data-qa': 'submit' } or {}

// Collision check at module load time
const ids = { submit: sid('submit'), btn: factory('btn') } as const;
assertNoPrefixCollisions(ids);
```

## Production Stripping

Test IDs are stripped from production builds automatically:

- **Default**: `NODE_ENV === "production"` → stripped; anything else → emitted
- **Override**: `PE_TESTIDS=on|off` overrides in both directions

```bash
# Production build (ids stripped):
NODE_ENV=production npm run build

# Production build WITH ids (for e2e validation):
PE_TESTIDS=on NODE_ENV=production npm run build
```

### Why Standard Tools Don't Work

`compiler.reactRemoveProperties` and `babel-plugin-react-remove-properties` strip
literal JSX attributes but **cannot** strip spread attributes:

```tsx
// The literal `data-testid` is removed, but the spread survives:
<div data-testid="literal" {...testIdProps(ids.foo)}>x</div>
```

This module strips inside `testIdProps()`, returning a frozen empty object when
stripping is on — so spreading is a no-op and the attribute never reaches the DOM.

## Backward compatibility

The `playwright-elements/testids` subpath still works — it re-exports this
package. Existing imports do not need to change. Use this package directly
when you want install-time isolation (no Playwright or lodash in
`node_modules`).

## API

See the [full Test IDs documentation](https://danteukraine.github.io/playwright-elements/test_ids) for the complete API reference.
