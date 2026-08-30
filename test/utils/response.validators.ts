import { expect } from '@playwright/test';
import type { Response } from '@playwright/test';

/**
 * Options for response validation
 */
export interface ResponseValidationOptions {
    expectedStatus?: number;
    checkOk?: boolean;
    checkContentType?: string | RegExp;
    checkUrlPattern?: RegExp | string;
}

/**
 * Validates a response with comprehensive checks
 * 
 * @param res - The Playwright response object
 * @param options - Validation options
 * @returns The response for chaining
 * 
 * @example
 * ```typescript
 * const res = await goto('/api/users');
 * await expectValidResponse(res, { expectedStatus: 200 });
 * ```
 */
export async function expectValidResponse(
    res: Response | null,
    options: ResponseValidationOptions = {}
): Promise<Response> {
    const {
        expectedStatus = 200,
        checkOk = true,
        checkContentType,
        checkUrlPattern
    } = options;

    expect(res).not.toBeNull();
    
    if (checkOk) {
        expect(res?.ok()).toBe(true);
    }
    
    expect(res?.status()).toBe(expectedStatus);
    
    if (checkContentType) {
        const contentType = res?.headers()['content-type'] || '';
        if (checkContentType instanceof RegExp) {
            expect(contentType).toMatch(checkContentType);
        } else {
            expect(contentType).toContain(checkContentType);
        }
    }
    
    if (checkUrlPattern) {
        const url = res?.url();
        if (checkUrlPattern instanceof RegExp) {
            expect(url).toMatch(checkUrlPattern);
        } else {
            expect(url).toContain(checkUrlPattern);
        }
    }
    
    return res!;
}

/**
 * Validates that a response represents a successful HTTP request
 * 
 * @param res - The Playwright response object
 * @param statusCode - Expected HTTP status code (default: 200)
 * @returns The response for chaining
 * 
 * @example
 * ```typescript
 * const res = await goto('/api/data');
 * await expectSuccessfulResponse(res);
 * ```
 */
export async function expectSuccessfulResponse(
    res: Response | null,
    statusCode: number = 200
): Promise<Response> {
    return expectValidResponse(res, { 
        expectedStatus: statusCode,
        checkOk: true
    });
}

/**
 * Validates that a response represents a redirect
 * 
 * @param res - The Playwright response object
 * @param expectedLocation - Expected redirect location (optional)
 * @returns The response for chaining
 * 
 * @example
 * ```typescript
 * const res = await goto('/old-path');
 * await expectRedirectResponse(res, '/new-path');
 * ```
 */
export async function expectRedirectResponse(
    res: Response | null,
    expectedLocation?: string
): Promise<Response> {
    expect(res).not.toBeNull();
    expect(res?.status()).toBeGreaterThanOrEqual(300);
    expect(res?.status()).toBeLessThan(400);
    
    if (expectedLocation) {
        const location = res?.headers()['location'];
        expect(location).toBeDefined();
        expect(location).toContain(expectedLocation);
    }
    
    return res!;
}

/**
 * Validates that a response represents a client error (4xx)
 * 
 * @param res - The Playwright response object
 * @param expectedStatus - Expected specific 4xx status code (optional)
 * @returns The response for chaining
 */
export async function expectClientErrorResponse(
    res: Response | null,
    expectedStatus?: number
): Promise<Response> {
    expect(res).not.toBeNull();
    expect(res?.status()).toBeGreaterThanOrEqual(400);
    expect(res?.status()).toBeLessThan(500);
    
    if (expectedStatus) {
        expect(res?.status()).toBe(expectedStatus);
    }
    
    return res!;
}

/**
 * Validates that a response represents a server error (5xx)
 * 
 * @param res - The Playwright response object
 * @param expectedStatus - Expected specific 5xx status code (optional)
 * @returns The response for chaining
 */
export async function expectServerErrorResponse(
    res: Response | null,
    expectedStatus?: number
): Promise<Response> {
    expect(res).not.toBeNull();
    expect(res?.status()).toBeGreaterThanOrEqual(500);
    expect(res?.status()).toBeLessThan(600);
    
    if (expectedStatus) {
        expect(res?.status()).toBe(expectedStatus);
    }
    
    return res!;
}
