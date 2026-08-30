import { expect } from '@playwright/test';
import type { Page, ViewportSize } from '@playwright/test';
import { BrowserInstance } from '../../src/index';

/**
 * Options for mobile context validation
 */
export interface MobileValidationOptions {
    checkViewport?: boolean;
    checkUserAgent?: boolean;
    checkTouchSupport?: boolean;
    expectedDevice?: string;
    minWidth?: number;
    maxWidth?: number;
}

/**
 * Validates that the current context is mobile with comprehensive checks
 * 
 * @param page - The Playwright page object
 * @param options - Validation options
 * 
 * @example
 * ```typescript
 * await expectMobileContext(page);
 * ```
 */
export async function expectMobileContext(
    page: Page,
    options: MobileValidationOptions = {}
): Promise<void> {
    const {
        checkViewport = true,
        checkUserAgent = true,
        checkTouchSupport = true,
        expectedDevice,
        minWidth = 0,
        maxWidth = 500
    } = options;

    expect(BrowserInstance.isContextMobile).toBe(true);
    
    if (checkViewport) {
        const viewport = page.viewportSize;
        expect(viewport).toBeDefined();
        expect(viewport!.width).toBeLessThanOrEqual(maxWidth);
        expect(viewport!.width).toBeGreaterThan(minWidth);
        expect(viewport!.height).toBeGreaterThanOrEqual(600);
    }
    
    if (checkUserAgent) {
        const userAgent = await page.evaluate(() => navigator.userAgent);
        expect(userAgent.toLowerCase()).toMatch(/iphone|ipad|android|mobile/i);
        
        if (expectedDevice) {
            expect(userAgent.toLowerCase()).toContain(expectedDevice.toLowerCase());
        }
    }
    
    if (checkTouchSupport) {
        const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
        expect(hasTouch).toBe(true);
    }
}

/**
 * Validates that the current context is desktop with comprehensive checks
 * 
 * @param page - The Playwright page object
 * @param options - Validation options
 * 
 * @example
 * ```typescript
 * await expectDesktopContext(page);
 * ```
 */
export async function expectDesktopContext(
    page: Page,
    options: Omit<MobileValidationOptions, 'expectedDevice'> = {}
): Promise<void> {
    const {
        checkViewport = true,
        checkUserAgent = true,
        checkTouchSupport = false,
        minWidth = 1024
    } = options;

    expect(BrowserInstance.isContextMobile).toBe(false);
    
    if (checkViewport) {
        const viewport = page.viewportSize;
        expect(viewport).toBeDefined();
        expect(viewport!.width).toBeGreaterThanOrEqual(minWidth);
        expect(viewport!.height).toBeGreaterThanOrEqual(768);
    }
    
    if (checkUserAgent) {
        const userAgent = await page.evaluate(() => navigator.userAgent);
        expect(userAgent.toLowerCase()).not.toMatch(/iphone|ipad|android|mobile/i);
    }
    
    if (checkTouchSupport) {
        const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
        expect(hasTouch).toBe(false);
    }
}

/**
 * Validates viewport dimensions match expected values
 * 
 * @param page - The Playwright page object
 * @param expected - Expected viewport dimensions
 * 
 * @example
 * ```typescript
 * await expectViewport(page, { width: 390, height: 844 }); // iPhone 13
 * ```
 */
export async function expectViewport(
    page: Page,
    expected: Partial<ViewportSize>
): Promise<void> {
    const viewport = page.viewportSize;
    expect(viewport).toBeDefined();
    
    if (expected.width !== undefined) {
        expect(viewport!.width).toBe(expected.width);
    }
    
    if (expected.height !== undefined) {
        expect(viewport!.height).toBe(expected.height);
    }
}

/**
 * Validates viewport dimensions are within expected ranges
 * 
 * @param page - The Playwright page object
 * @param options - Min/max dimensions
 * 
 * @example
 * ```typescript
 * await expectViewportInRange(page, { maxWidth: 500, minHeight: 800 });
 * ```
 */
export async function expectViewportInRange(
    page: Page,
    options: {
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
    } = {}
): Promise<void> {
    const { minWidth, maxWidth, minHeight, maxHeight } = options;
    const viewport = page.viewportSize;
    expect(viewport).toBeDefined();
    
    if (minWidth !== undefined) {
        expect(viewport!.width).toBeGreaterThanOrEqual(minWidth);
    }
    
    if (maxWidth !== undefined) {
        expect(viewport!.width).toBeLessThanOrEqual(maxWidth);
    }
    
    if (minHeight !== undefined) {
        expect(viewport!.height).toBeGreaterThanOrEqual(minHeight);
    }
    
    if (maxHeight !== undefined) {
        expect(viewport!.height).toBeLessThanOrEqual(maxHeight);
    }
}

/**
 * Validates that touch support is available in the current context
 * 
 * @param page - The Playwright page object
 * @param shouldHaveTouch - Whether touch should be supported (default: true for mobile)
 * 
 * @example
 * ```typescript
 * await expectTouchSupport(page);
 * await expectTouchSupport(page, false); // For desktop
 * ```
 */
export async function expectTouchSupport(
    page: Page,
    shouldHaveTouch: boolean = true
): Promise<void> {
    const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
    expect(hasTouch).toBe(shouldHaveTouch);
}

/**
 * Validates device orientation
 * 
 * @param page - The Playwright page object
 * @param expectedOrientation - 'portrait' or 'landscape'
 * 
 * @example
 * ```typescript
 * await expectOrientation(page, 'portrait');
 * ```
 */
export async function expectOrientation(
    page: Page,
    expectedOrientation: 'portrait' | 'landscape'
): Promise<void> {
    const orientation = await page.evaluate(() => {
        if (window.matchMedia) {
            if (window.matchMedia('(orientation: portrait)').matches) {
                return 'portrait';
            }
            if (window.matchMedia('(orientation: landscape)').matches) {
                return 'landscape';
            }
        }
        return 'unknown';
    });
    
    expect(orientation).toBe(expectedOrientation);
}

/**
 * Validates pixel density (device pixel ratio)
 * 
 * @param page - The Playwright page object
 * @param expectedRatio - Expected device pixel ratio (e.g., 2, 3)
 * 
 * @example
 * ```typescript
 * await expectPixelRatio(page, 3); // iPhone 13 has DPR of 3
 * ```
 */
export async function expectPixelRatio(
    page: Page,
    expectedRatio: number
): Promise<void> {
    const pixelRatio = await page.evaluate(() => window.devicePixelRatio);
    expect(pixelRatio).toBe(expectedRatio);
}
