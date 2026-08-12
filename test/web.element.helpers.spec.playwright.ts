import { test, expect } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test
// This file demonstrates the migration pattern

test.describe(`Web element build in helpers`, () => {

    test.beforeEach(async ({ initBrowserInstance, page, goto }) => {
        // BrowserInstance is initialized automatically by the initBrowserInstance fixture
        await goto(localFilePath);
        await expect(page).toHaveURL(/.*/);
        await page.waitForSelector('h1');
    })

    test.afterEach(async ({ initBrowserInstance }) => {
        // BrowserInstance cleanup is handled automatically by the fixture
    })

    test(`syncForEach should work with async callback`, async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const elements = $(`.field`);
        await elements.syncForEach( async (el) => await el.pressSequentially('1234567890'));
        const elementsTexts: (string | null)[] = [];
        await elements.syncForEach(async (e) => elementsTexts.push(await e.inputValue()));
        expect(elementsTexts).toContain('1234567890');
        expect(elementsTexts.filter(t => t === '1234567890').length).toBeGreaterThanOrEqual(5);
    })

    test(`syncForEach should work with sync callback`, async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.syncForEach((el) => el.textContent().then(value => elementsTexts.push(value)));
        expect(elementsTexts).toContain('1');
        expect(elementsTexts).toContain('text');
    })

    test(`asyncForEach should work with async callback`, async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.asyncForEach(async (e) => elementsTexts.push(await e.textContent()));
        expect(elementsTexts).toContain('1');
        expect(elementsTexts).toContain('text');
    })

    test(`asyncForEach should work with sync callback`, async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const elements = $(`li`);
        const elementsTexts: (string | null)[] = [];
        await elements.asyncForEach((el) => el.textContent().then(value => elementsTexts.push(value)));
        expect(elementsTexts).toContain('1');
        expect(elementsTexts).toContain('text');
    })

    test(`map should work with async callback`, async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const elements = $(`li`);
        const elementsText = await elements.map( async (el) => await el.textContent());
        expect(elementsText).toContain('1');
        expect(elementsText).toContain('text');
    })

    test(`map should work with sync callback`, async ({ initBrowserInstance }) => {
        const { $ } = await import('../src');
        const elements = $(`li`);
        const selectors = await elements.map( (el) => el.textContent());
        expect(selectors).toContain('1');
    })
})
