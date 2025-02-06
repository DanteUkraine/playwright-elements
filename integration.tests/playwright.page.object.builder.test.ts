import { test as baseTest, expect, buildPageObject, PageObject } from '../src/index.ts';
import * as pageObjectModule from './resources/page.object.ts';
import { HomePage, SettingsPage } from './resources/page.object.ts';

type TestFixtures = { pageObject: PageObject<typeof pageObjectModule> };

const test = baseTest.extend<TestFixtures>({
    pageObject: [async ({}, use) => {
        await use(buildPageObject(pageObjectModule));
    }, { scope: 'test' }],
});

test.describe('Playwright test integration', () => {

    test('page object builder should return instances of pages', async ({ pageObject }) => {
        expect(pageObject).toHaveProperty('home');
        expect(pageObject.home).toBeInstanceOf(HomePage);
        expect(typeof pageObject.home.welcome).toBe('function');

        const welcomeMessage = pageObject.home.welcome();
        expect(typeof welcomeMessage).toBe('string');

        expect(pageObject).toHaveProperty('settings');
        expect(pageObject.settings).toBeInstanceOf(SettingsPage);
        expect(typeof pageObject.settings.getSettings).toBe('function');
    });

});
