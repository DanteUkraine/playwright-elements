#Playwright-elements
___
Playwright elements helps you to create reusable components and allows lazy initialization.

***Installation:*** `npm install -D playwright-elements`
___
## WebElement 

No need to pass instance of page into your page object. 
```ts
import {$} from "playwright-elements";

class MainPage {
    readonly header = $(`.navbar`);
}
```
Each element which was created by **$** function returns instance of WebElement so code may look next:
```ts
import {$, WebElement} from "playwright-elements";

class MainPage {
    readonly header: WebElement = $(`.navbar`);
}
```
**$** function is just a shortcut for **new WebElement('.navbar');**


Each WebElement can have sub elements. 
**subElements({logo: $('.navbar__title')})** returns type intersection.
```ts
import {$, WebElement} from "playwright-elements";

type Header = WebElement & { logo: WebElement }

class MainPage {
    readonly header: Header = $(`.navbar`)
        .subElements({
            logo: $(`.navbar__title`)
        });
}
```

___

Playwright elements provides you with extended **test** annotation 
and access to playwright expect methods via **expect()** function
```ts
import {test} from "playwright-elements";
import {MainPage} from "main.page"

test.describe(`Playwright test integration`, () => {

    test(`expect positive`, async () => {
        const mainPage = new MainPage();
        await mainPage.header.logo.expect().toBeVisible();
        await mainPage.header.logo.expect().toHaveText("Playwright");
    })

})
```
Custom ***test*** annotation will check if **baseURL** is set in playwright config 
and if yes will perform *goto* method from *page*.


```ts

```


