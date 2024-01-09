import { test as baseTest, $, usePage, expect } from '../src';
import { Page } from '@playwright/test';

type TestFixtures = { secondContextPage: Page };
const test = baseTest.extend<TestFixtures, {}>({
    secondContextPage: [async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await use(page);
        await context.close();
    }, { scope: 'test' }]
});

const title = $('h1');

class TestFixturesPage {
    readonly title = title;
}

class MainPage {
    readonly title = title;
}
test.describe('Playwright test integration', () => {
    const testFixturesPage = new TestFixturesPage();
    const mainPage = new MainPage();

    test('usePage with promise all', async ({ goto, secondContextPage }) => {
        await Promise.all([goto(), secondContextPage.goto('https://playwright.dev/docs/test-fixtures')]);
        const customContextPromise = usePage(secondContextPage, async () => {
            await testFixturesPage.title.softExpect().toHaveText('Fixtures');
        });
        const defaultContextPromise = mainPage.title.softExpect()
            .toHaveText('Playwright enables reliable end-to-end testing for modern web apps.');
        await Promise.all([defaultContextPromise, customContextPromise]);
    });

    test('usePage returns value', async ({ goto, page }) => {
        await goto('/docs/test-fixtures');
        const text = await usePage<string>(page, async () => {
            return testFixturesPage.title.textContent();
        });
        expect(text).toEqual('Fixtures');
    });
});

