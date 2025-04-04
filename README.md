# Playwright-elements
[![Awesome](https://awesome.re/mentioned-badge.svg)](https://github.com/mxschmitt/awesome-playwright/blob/master/README.md#utils)

___
*Playwright-elements allows you to create reusable components with child elements and chainable methods. 
It minimizes boilerplate code in your page objects and even enables you to work without them entirely.*

*This library makes it easy to represent the tree structure of a web component. 
Each component can have multiple descendants, and all elements in the tree inherit the Locator API. 
You can therefore chain calls-mixing element selectors with synchronous methods-to build expressive and concise tests.*

***Installation:***

Run the following command to install the package:

`npm install -D playwright-elements`

___
- [Get started](docs/get_started.md)
- [Web element](docs/web_element.md)
- [Playwright elements fixtures](docs/playwright_elements_fixtures.md)
- [Build page object](docs/build_page_object.md)
- [Browser instance](docs/browser_instance.md)

#### Tests with playwright-elements:

pages/loginPage.ts
```ts
import { $ } from 'playwright-elements';

// Component can be defined outside of class and is independent from page lifecicle. 
const header = $('.header')
  .with({
    logo: $('.header-logo'),
    avatar: $('.avatar')
  });

export class LoginPage {
  readonly header = header;
  // Login form exist only on one page and can be defined only in this page.
  readonly form = $('.login-form')
      .with({
          usernameInput: $('input[name="username"]'),
          passwordInput: $('input[name="password"]'),
          loginButton: $('button[type="submit"]'),
          async fillForm(userName: string, password: string) {
              await this.usernameInput.fill(userName);
              await this.passwordInput.fill(password);
              await this.loginButton.click();
          }
      });
}

```
pages/index.ts
```ts
export * from './loginPage';
```
test/fixtures.ts
```ts
import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import * as pageObjectModule from '../pages';
// Allows to set page object fixture once and it will extend fixture with new pages in module automatically.
type TestFixtures = { pageObject: PageObject<typeof pageObjectModule> };

export const test = baseTest.extend({
    pageObject: [async ({}, use) => {
        await use(buildPageObject(pageObjectModule));
    }, { scope: 'test' }],
});
```
Now enjoy.
test/login.test.ts
```ts
import { test } from './fixtures';

test('check login page', async ({ pageObject }) => {
    await pageObject.login.form.fillForm('UserName', 'Pass!');
    
    await pageObject.login.header.logo.expect().toBeVisible();
    await pageObject.login.header.avatar.expect().toBeVisible();
});
```

#### Tests with playwright-elements using component driven test style:

elements.ts
```ts
import { $ } from 'playwright-elements';

// Component can be defined outside of class and is independent from page lifecicle. 
export const header = $('.header')
  .with({
    logo: $('.header-logo'),
    avatar: $('.avatar')
  });

export const form = $('.login-form')
  .with({
    usernameInput: $('input[name="username"]'),
    passwordInput: $('input[name="password"]'),
    loginButton: $('button[type="submit"]'),
    async fillForm(userName: string, password: string) {
      await this.usernameInput.fill(userName);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    }
  });

```

test/fixtures.ts
```ts
import { test as baseTest } from 'playwright-elements';
import * as elements from '../elements';

type TestFixtures = { elements: typeof elements };

export const test = baseTest.extend({
    elements: [async ({}, use) => {
        await use(elements);
    }, { scope: 'test' }],
});
```
Now enjoy component driven tests style.
test/login.test.ts
```ts
import { test } from './fixtures';

test('check login page', async ({ elements }) => {
    await elements.form.fillForm('UserName', 'Pass!');
    
    await elements.header.logo.expect().toBeVisible();
    await elements.header.avatar.expect().toBeVisible();
});
```

*[Release notes.](https://github.com/DanteUkraine/playwright-elements/releases)*
