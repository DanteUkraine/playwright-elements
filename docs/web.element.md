## WebElement

*WebElement class is a wrapper on playwright Locator. Tt was created to allow lazy initialization in 
page object and creation of complex web components which support more than two levels deep sub elements
with ability to add custom methods.*
___
- [subElements()](#sub-elements)
- [expect()](#expect)
- [additionalMethods() and getters: locator and _](#additional-methods-locator-and-underscore)

___
First you need to allow lazy initialization, 
if you use `@playwright/test` see: [Playwright Test fixtures](playwright.test.fixtures.md).
In case you use any another test runner see: [Browser Instance](browser.instance.md)
___

### Sub elements

Complex component creation:

```ts
import { $ } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .subElements({
            userInfoSection: $(`.userInfo`)
                .subElements({
                    firstName: $(`.first-name`),
                    lastName: $(`.last-name`),
                    avatar: $(`.userImage`)
                })
        })
}
```
___
###expect()
Web element has methods `expect()` and `softExpect()` which allows access to 
[playwright assert library](https://playwright.dev/docs/test-assertions). 
Please pay attention that Locator passed to native expect method under the hood 
that's why you can access only locators based assert methods.

```ts
test(`header should contain user info`, async () => {
    const mainPage = new MainPage();
    await mainPage.header.userInfoSection.firstName.expect().toHaveText(`Bob`);
    await mainPage.header.userInfoSection.lastName.expect().toHaveText(`Automation`);
    await mainPage.header.userInfoSection.avatar.expect().toBeVisible();
})
```
---
### Additional methods, Locator and underscore

```ts
import { $, WebElement } from "playwright-elements"; 

class MainPage {
    readonly header = $(`.header`)
        .subElements({
            humburgerButton: $(`.hButton`),
            menu: $(`.menu`)
                .subElements({
                    item: $(`.menu-item`)
                        .additionalMethods({
                            async hoverAndClick(this: WebElement) {
                                await this.locator.hover();
                                await this._.click();
                            }
                        })
                })
        })
}
```

Web element has getters `locator` and `_` both return instance of [Locator](https://playwright.dev/docs/api/class-locator).
Also `hoverAndClick` method now can be used on item element. Please pay attention that to access web element
default methods inside additional method declaration is used fake `this: WebElement` pointer. 
```ts
test(`user can open documentaation`, async () => {
    const mainPage = new MainPage();
    await mainPage.header.humburgerButton._.click();
    await mainPage.header.menu.item.withText(`Documentation`).hoverAndClick();
})
```

