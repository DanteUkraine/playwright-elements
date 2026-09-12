import { test, expect, $ } from '../src/index';

test.describe('MOCK SUT Verification', () => {

    test('homepage loads with navbar and main heading', async ({ goto }) => {
        await goto('/');
        
        // Verify navbar exists with correct aria-label
        const navbar = $('.navbar');
        await navbar.expect().toBeVisible();
        await expect(await navbar.getAttribute('aria-label')).toBe('Main');
        
        // Verify navbar title
        const navbarTitle = $('.navbar__title');
        await navbarTitle.expect().toBeVisible();
        await expect(await navbarTitle.textContent()).toBe('Playwright');
        
        // Verify main heading
        const heading = $('h1');
        await heading.expect().toBeVisible();
        await expect(await heading.textContent()).toMatch(/Playwright enables reliable/);
        
        // Verify navigation button
        const button = $('button[title="Navigation"]');
        await button.expect().toBeVisible();
    });

    test('test-typescript page loads correctly', async ({ goto }) => {
        await goto('/docs/test-typescript');
        
        // Verify navbar
        const navbar = $('.navbar');
        await navbar.expect().toBeVisible();
        await expect(await navbar.getAttribute('aria-label')).toBe('Main');
        
        // Verify page heading
        const heading = $('h1');
        await heading.expect().toBeVisible();
        await expect(await heading.textContent()).toMatch(/TypeScript Testing/);
    });

    test('test-fixtures page loads correctly', async ({ goto }) => {
        await goto('/docs/test-fixtures');
        
        // Verify navbar
        const navbar = $('.navbar');
        await navbar.expect().toBeVisible();
        await expect(await navbar.getAttribute('aria-label')).toBe('Main');
        
        // Verify page heading
        const heading = $('h1');
        await heading.expect().toBeVisible();
        await expect(await heading.textContent()).toBe('Fixtures');
    });

    test('all required selectors are present on homepage', async ({ goto }) => {
        await goto('/');
        
        // Test all selectors used by other integration tests
        const navbar = $('.navbar');
        await navbar.expect().toBeVisible();
        
        const navbarTitle = $('.navbar__title');
        await navbarTitle.expect().toBeVisible();
        
        const heading = $('h1');
        await heading.expect().toBeVisible();
        
        const button = $('button[title="Navigation"]');
        await button.expect().toBeVisible();
    });
});
