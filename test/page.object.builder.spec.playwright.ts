import { test, expect } from '../src';
import { buildPageObject } from '../src';
import * as pageObjectModule from '../integration.tests/resources/page.object';
import { HomePage, SettingsPage, AboutBoxElement } from '../integration.tests/resources/page.object';

// Migrated from mocha/chai to @playwright/test
// This file doesn't need browser as it's testing buildPageObject function only

test.describe('buildPageObject', () => {
    test('should return instances of pages using default options (suffix "Page", lowerCaseFirst true)', () => {
        const pages = buildPageObject(pageObjectModule);

        expect(pages).toHaveProperty('home');
        expect(pages.home).toBeInstanceOf(HomePage);
        expect(typeof (pages.home as any).welcome).toBe('function');

        expect(pages).toHaveProperty('settings');
        expect(pages.settings).toBeInstanceOf(SettingsPage);
        expect(typeof (pages.settings as any).getSettings).toBe('function');

        expect(Object.keys(pages)).not.toContain('aboutBoxElement');
    });

    test('should return instances of pages with a custom suffix "Box" and preserve case (lowerCaseFirst false)', () => {
        const pages = buildPageObject(pageObjectModule, { suffix: 'Element', lowerCaseFirst: false });

        expect(pages).toHaveProperty('AboutBox');
        expect(pages.AboutBox).toBeInstanceOf(AboutBoxElement);
        expect(typeof (pages.AboutBox as any).info).toBe('function');

        expect(pages).not.toHaveProperty('home');
        expect(pages).not.toHaveProperty('HomePage');
        expect(pages).not.toHaveProperty('homePage');
        expect(pages).not.toHaveProperty('settings');
        expect(pages).not.toHaveProperty('SettingsPage');
        expect(pages).not.toHaveProperty('settingsPage');
    });

    test('should return all classes if suffix is an empty string (with lowerCaseFirst true)', () => {
        const pages = buildPageObject(pageObjectModule, { suffix: '', lowerCaseFirst: true });

        expect(pages).toHaveProperty('homePage');
        expect(pages.homePage).toBeInstanceOf(HomePage);
        expect(typeof (pages.homePage as any).welcome).toBe('function');

        expect(pages).toHaveProperty('settingsPage');
        expect(pages.settingsPage).toBeInstanceOf(SettingsPage);
        expect(typeof (pages.settingsPage as any).getSettings).toBe('function');

        expect(pages).toHaveProperty('aboutBoxElement');
        expect(pages.aboutBoxElement).toBeInstanceOf(AboutBoxElement);
        expect(typeof (pages.aboutBoxElement as any).info).toBe('function');
    });
});
