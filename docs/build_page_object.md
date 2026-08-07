---
layout: default
title: Get started
---
[Go to Main Page >>](./../README.md)

## Build page object

The buildPageObject utility automatically creates a strongly-typed page object instance from a module containing
multiple page classes, providing full TypeScript autocompletion support in your tests.

- [WatcherManager Class](#watchermanager-class)
- [Options](#build-page-object-options-suffix-and-lowercasefirst)
- [Generate index file](#generate-index-file)
    - [CLI Interface](#cli-interface)
    - [Index Generator programing interface](#programing-interface)

## WatcherManager Class

The `WatcherManager` class provides centralized management of file system watchers for the index file generation functionality. It allows you to create, track, and clean up multiple watchers across nested directories.

### Purpose

When using `generateIndexFile()` with `watch: true` option, multiple watchers may be created for nested directories. The `WatcherManager`:

- Tracks all active file system watchers
- Provides a single point to close all watchers
- Prevents memory leaks from uncleaned watchers
- Simplifies watcher lifecycle management

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `watchers` | `FSWatcher[]` | Array of all active chokidar watchers |

### Methods

#### addWatcher(watcher: FSWatcher): void

Adds a watcher to the manager's tracking list.

```typescript
import { WatcherManager, generateIndexFile } from 'playwright-elements';

const manager: WatcherManager = createWatcherManager();
const watcher = chokidar.watch('./some/path');

manager.addWatcher(watcher);
```

#### closeAll(): Promise<void>

Closes all tracked watchers and clears the watchers array.

```typescript
import { generateIndexFile } from 'playwright-elements';

// Create watchers
const manager = generateIndexFile('./src', { watch: true });

// Later, when you need to clean up (e.g., before process exit)
await manager.closeAll();
```

### Usage Patterns

#### Pattern 1: Automatic Cleanup with CLI

When using the CLI, watchers are automatically managed:

```bash
npx generate-index ./src --watch true
# Watchers are automatically tracked and can be cleaned up
```

#### Pattern 2: Manual Management in Tests

For test environments where you need explicit control:

```typescript
import { generateIndexFile } from 'playwright-elements';

before(async () => {
    // Start watchers for all page objects
    manager = generateIndexFile('./pages', { watch: true, cliLog: true });
});

after(async () => {
    // Clean up all watchers
    await manager.closeAll();
});

test('page object tests', async () => {
    // Your tests here
    // Index files will be automatically regenerated when files change
});
```

#### Pattern 3: Programmatic Usage with Custom Manager

```typescript
import { generateIndexFile, createWatcherManager, WatcherManager } from 'playwright-elements';

// Create a shared manager for multiple index generation calls
const sharedManager: WatcherManager = createWatcherManager();

// Generate index files for multiple directories with the same manager
generateIndexFile('./pages', { watch: true }, sharedManager);
generateIndexFile('./components', { watch: true }, sharedManager);
generateIndexFile('./utils', { watch: true }, sharedManager);

// All watchers are tracked in the shared manager
// Close all with a single call
await sharedManager.closeAll();
```

### Best Practices

1. **Always Clean Up**: Always call `closeAll()` when your process is exiting to prevent memory leaks
2. **Shared Manager for Related Directories**: Use a shared manager when generating index files for related directories
3. **Separate Managers for Independent Projects**: Use separate managers for independent projects or modules
4. **Error Handling**: Wrap `closeAll()` in try-catch to handle cleanup errors gracefully
5. **Logging**: Use `cliLog: true` option for debugging watcher issues

### Error Handling

```typescript
import { generateIndexFile } from 'playwright-elements';

const manager = generateIndexFile('./pages', { watch: true });

// Later...
try {
    await manager.closeAll();
} catch (error) {
    console.error('Failed to close watchers:', error);
    // Handle error or exit gracefully
}
```

### TypeScript Usage

The `WatcherManager` is fully typed:

```typescript
import type { FSWatcher } from 'chokidar';
import type { WatcherManager } from 'playwright-elements';

function setupWatchers(): WatcherManager {
    return generateIndexFile('./src', { watch: true });
}

const manager: WatcherManager = setupWatchers();
```

### See Also

- [generateIndexFile() Function](#programing-interface)
- [CLI Interface](#cli-interface)

Page object
```ts
// pages/index.ts
export class HomePage {
  welcome() {
    return 'Welcome to homepage';
  }
}

export class SettingsPage {
  getSettings() {
    // Implementation
  }
}
```
Type-Safe Fixture Setup:
```ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import * as pageObjectModule from './pages';

type TestFixtures = { pageObject: PageObject<typeof pageObjectModule> };

const test = baseTest.extend<TestFixtures>({
  pageObject: [async ({}, use) => {
    await use(buildPageObject(pageObjectModule));
  }, { scope: 'test' }],
});

```

Then use in your tests with full autocompletion:
```ts
test('navigation example', async ({ pageObject }) => {
  // Full autocompletion for all pages and their methods
  const welcomeMessage = pageObject.home.welcome();
  await pageObject.settings.getSettings();
});
```

The pageObject fixture automatically includes all exported page classes, with properties matching their lowercase names:
pageObject.home - instance of HomePage
pageObject.settings - instance of SettingsPage
This approach scales automatically as you add new page objects to your test suite,
without requiring any changes to your test fixtures.

### Build Page Object Options: suffix and lowerCaseFirst
The new buildPageObject feature not only instantiates all exported page classes automatically but also provides
options to control how the keys (i.e., property names) are generated for each page object. Two important options are:

```ts
// Default behavior:
// suffix: 'Page', lowerCaseFirst: true
const pageObject1 = buildPageObject(pageObjectModule);
// Resulting keys:
pageObject1.home      // → Instance of HomePage
pageObject1.settings  // → Instance of SettingsPage

// Retain the full class name by not removing any suffix:
const pageObject2 = buildPageObject(pageObjectModule, { suffix: '' });
// Resulting keys:
pageObject2.homePage      // → Instance of HomePage
pageObject2.settingsPage  // → Instance of SettingsPage

// Remove suffix as usual but preserve original casing:
const pageObject3 = buildPageObject(pageObjectModule, { lowerCaseFirst: false });
// Resulting keys:
pageObject3.Home      // → Instance of HomePage
pageObject3.Settings  // → Instance of SettingsPage
```

### Key Benefits of buildPageObject factory method.
- Automatically creates page object instances from all exported page classes
- Provides full TypeScript autocompletion for all page methods
- Eliminates need to manually update fixtures when adding new pages
- Maintains type safety across your entire test suite

### Generate index file

#### CLI Interface

The index generator is also available as a standalone CLI tool. This provides a convenient way to generate (and optionally watch) index files without modifying your code, which is especially useful in CI/CD pipelines or during test environment setup for UI tests.

**CLI Usage Examples:**

Generate index file once:
```shell
npx generate-index ./src
```
Generate index files with watch mode enabled:
```shell
npx generate-index ./src --watch true
```
Generate index files with console logs:
```shell
npx generate-index ./src --cliLog true
```
Specify quote style (use double quotes, default value is single quotes):
```shell
npx generate-index ./src --quotes '"'
```

#### Programing interface

The `generateIndexFile` function generates an `index.ts` file in a specified folder.
It scans the folder for `.ts` files (excluding index.ts) and creates export statements for each file.
This function is useful for automating the creation of centralized export files in TypeScript projects.

#### Parameters:
- `folder` (string): The directory where the index.ts file will be created.
- `options` (Options, optional):
    - `cliLog` (boolean, default: false): Enables or disables logging to the console.
    - `quotes` ( ' | ", default: ' ): Specifies whether to use single or double quotes in the generated export statements.
    - `watch` (boolean, optional, default: false): starts watchers on backgraund for each subdirectory.

#### File Filtering Logic

The index generator uses specific filtering rules to determine which files to include in the generated index files:

**Included Files:**
- All TypeScript files (`.ts` extension) in the specified directory and its subdirectories

**Excluded Files:**
- `index.ts` files (to prevent circular references)
- Dotfiles (files starting with `.`) when in watch mode
- Non-TypeScript files (any file not ending with `.ts`)

**File Selection Behavior:**
- Only files ending with `.ts` are processed
- The `index.ts` file is automatically excluded from export statements
- Nested directories are processed recursively
- Each directory gets its own `index.ts` file with exports for its contents
- Subdirectory index files are exported from parent index files

**Examples:**
```text
src/
├── page1.ts          ✅ Included
├── page2.ts          ✅ Included
├── index.ts          ❌ Excluded (always)
├── utils.ts          ✅ Included
└── subdir/
    ├── component.ts  ✅ Included in subdir/index.ts
    └── index.ts      ❌ Excluded from subdir/index.ts
```

#### Example Usage:
The function can be used in various contexts. For example, it can be called in a
Playwright configuration file to dynamically generate an index.ts file before running tests.
```ts
import { test as baseTest, buildPageObject, PageObject, generateIndexFile } from 'playwright-elements';
import * as pageObjectModule from './pages';

// Generate an index files recursively in the specified folder
generateIndexFile('./page.object'); // one time generation

type TestFixtures = { pageObject: PageObject<typeof pageObjectModule> };

export const test = baseTest.extend({
  page: [async ({}, use) => {
    await use(buildPageObject(pageObjectModule));
  }, { scope: 'test' }],
});
```

Watch mode usage example:
```ts
import { generateIndexFile } from '../src/index';

// Generate an index files recursively in the specified folder
const watchers = generateIndexFile('./page.object', { watch: true });
// you should close all watchers before process exit. 
// Each nested directory with index file will have dedicated watcher
watchers.closeAll();
```

#### Before Generation:
```text
testFolder/
├── file1.ts
├── file2.ts
└── nested/
    ├── nestedFile1.ts
```

#### After Generation:
```text
testFolder/
├── index.ts // root level will include "export * from './nested'";
├── file1.ts
├── file2.ts
└── nested/
    ├── index.ts
    ├── nestedFile1.ts
```
[Go to Main Page >>](./../README.md)