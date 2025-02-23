---
layout: default
title: Get started
---
[Go to Main Page >>](./../README.md)

## Build page object

The buildPageObject utility automatically creates a strongly-typed page object instance from a module containing
multiple page classes, providing full TypeScript autocompletion support in your tests.

- [Options](#build-page-object-options-suffix-and-lowercasefirst)
- [Generate index file](#generate-index-file)
    - [CLI Interface](#cli-interface)
    - [Index Generator programing interface](#programing-interface)

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