import { test as baseTest, $, usePage, expect } from '../src/index';
import { Page } from '@playwright/test';

type TestFixtures = { secondContextPage: Page, useSecondContext: <T>(callback: () => Promise<T>) => Promise<T> };
const test = baseTest.extend<TestFixtures>({
    secondContextPage: [async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await use(page);
        await context.close();
    }, { scope: 'test' }],
    useSecondContext: [async ({ secondContextPage }, use) => {
        await use(<T>(callback: () => Promise<T>) => usePage<T>(secondContextPage, callback));
    }, {  scope: 'test' }]
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
        const text = await usePage(page, async () => {
            return testFixturesPage.title.textContent();
        });
        expect(text).toEqual('Fixtures');
    });

    test('usePage as fixture returns value', async ({ goto, page, usePage }) => {
        await goto('/docs/test-fixtures');
        const text = await usePage(page, async () => {
            return title.textContent();
        });
        expect(text).toEqual('Fixtures');
    });

    test('usePage wrapped and goto used inside', async ({ goto, useSecondContext }) => {
        await goto();
        const text = await useSecondContext(async () => {
            await goto('/docs/test-fixtures');
            return title.textContent();
        });
        expect(text).toEqual('Fixtures');
        expect(await title.textContent()).toEqual('Playwright enables reliable end-to-end testing for modern web apps.')
    });
});

