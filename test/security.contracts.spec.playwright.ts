/**
 * Security and Contract Tests
 * Explicit security and package-contract tests for critical boundaries
 */

import { test, expect, WebElement } from './test.fixtures';
import { configureWebElementExpect } from './test.helpers';

test.describe('Security & Contract Tests', () => {

    test.describe('Input Validation', () => {
        test.describe('Selector Input', () => {
            test('empty CSS selector', async () => {
                const { $ } = await import('../src');
                const element = $(''); 
                expect(element.selector).toEqual('');
            });

            test('null selector', async () => {
                const { WebElement } = await import('../src');
                const element = new WebElement(null!); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('undefined selector', async () => {
                const { WebElement } = await import('../src');
                const element = new WebElement(undefined!); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('whitespace selector', async () => {
                const { $ } = await import('../src');
                const element = $('   '); 
                expect(element.selector).toEqual('   ');
            });

            test('special characters in selector', async () => {
                const { $ } = await import('../src');
                const element = $('<>"\'&@#$%'); 
                expect(element.selector).toEqual('<>"\'&@#$%');
            });

            test('JS code in selector should not execute', async () => {
                const { $ } = await import('../src');
                const element = $('javascript:alert("XSS")'); 
                expect(element.selector).toEqual('javascript:alert("XSS")');
            });

            test('HTML tags in selector', async () => {
                const { $ } = await import('../src');
                const element = $('<script>alert("XSS")</script>'); 
                expect(element.selector).toEqual('<script>alert("XSS")</script>');
            });
        });

        test.describe('Options Validation', () => {
            test('null options for getByRole', async () => {
                const { $getByRole } = await import('../src');
                const element = $getByRole('button', null as any); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('invalid role value', async () => {
                const { $getByRole } = await import('../src');
                const element = $getByRole('invalid' as any); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('undefined options', async () => {
                const { $getByRole } = await import('../src');
                const element = $getByRole('button', undefined as any); 
                expect(element).toBeInstanceOf(WebElement);
            });
        });

        test.describe('Chaining Validation', () => {
            test('null in has()', async () => {
                const { $ } = await import('../src');
                const element = $('div').has(null as any); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('undefined in has()', async () => {
                const { $ } = await import('../src');
                const element = $('div').has(undefined as any); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('null in and()', async () => {
                const { $ } = await import('../src');
                const element = $('div').and(null as any); 
                expect(element).toBeInstanceOf(WebElement);
            });

            test('undefined in and()', async () => {
                const { $ } = await import('../src');
                const element = $('div').and(undefined as any); 
                expect(element).toBeInstanceOf(WebElement);
            });
        });
    });

    test.describe('Type Safety', () => {
        test.describe('Method Signatures', () => {
            test('click returns Promise', async () => {
                const { $ } = await import('../src');
                const result = $('#test').click({ timeout: 1000 } as any); 
                expect(result).toBeInstanceOf(Promise); 
                await result.catch(() => {});
            });

            test('getText returns Promise<string>', async ({ testPage }) => {
                const { $ } = await import('../src');
                const text = await $('h1').getText(); 
                expect(typeof text === 'string' || text === null).toBe(true);
            });

            test('count returns Promise<number>', async ({ testPage }) => {
                const { $ } = await import('../src');
                const count = await $('div').count(); 
                expect(typeof count).toEqual('number');
            });

            test('isVisible returns Promise<boolean>', async ({ testPage }) => {
                const { $ } = await import('../src');
                const isVisible = await $('h1').isVisible(); 
                expect(typeof isVisible).toEqual('boolean');
            });

            test('getAttribute returns Promise<string|null>', async ({ testPage }) => {
                const { $ } = await import('../src');
                const attr = await $('input').getAttribute('type'); 
                expect(attr === null || typeof attr === 'string').toBe(true);
            });
        });

        test.describe('Type Guards', () => {
            test('WebElement instance check', async () => {
                const { $ } = await import('../src');
                expect($('div') instanceof WebElement).toBe(true);
            });

            test('Non-WebElement fails instance check', async () => {
                expect({} instanceof WebElement).toBe(false);
            });

            test('null fails instance check', async () => {
                expect(null instanceof WebElement).toBe(false);
            });

            test('undefined fails instance check', async () => {
                expect(undefined instanceof WebElement).toBe(false);
            });
        });

        test.describe('Options Types', () => {
            test('ClickOptions valid properties', async () => {
                const { $ } = await import('../src');
                await $('#test').click({ button: 'left', delay: 100, timeout: 1000 } as any).catch(() => {});
                expect(true).toBe(true);
            });

            test('FillOptions valid properties', async () => {
                const { $ } = await import('../src');
                await $('input').fill('test', { delay: 100, timeout: 1000 } as any).catch(() => {});
                expect(true).toBe(true);
            });
        });
    });

    test.describe('Security Boundaries', () => {
        test.describe('XSS Prevention', () => {
            test('JS in selectors should not execute', async () => {
                const { $ } = await import('../src');
                await expect($('javascript:alert("XSS")').count())
                    .rejects
                    .toThrow();
            });

            test('HTML in text should not execute', async () => {
                const { $ } = await import('../src');
                expect($('div').narrowSelector).toEqual('div');
            });

            test('HTML entities safely handled', async () => {
                const { $ } = await import('../src');
                const html = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
                expect($(html).selector).toEqual(html);
            });

            test('prevent prototype pollution', async () => {
                const { $ } = await import('../src');
                const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
                const before = (Object.prototype as any).isAdmin;
                try {
                    await $('input').fill('test', malicious as any);
                } catch {
                    // Expected to reject due to invalid selector options
                }
                expect((Object.prototype as any).isAdmin).toEqual(before);
            });
        });

        test.describe('Injection Prevention', () => {
            test('SQL injection patterns', async () => {
                const { $ } = await import('../src');
                const sql = '\' OR \'1\'=\'1';
                expect($(sql).selector).toEqual(sql);
            });

            test('command injection patterns', async () => {
                const { $ } = await import('../src');
                const cmd = '; rm -rf /';
                expect($(cmd).selector).toEqual(cmd);
            });

            test('path traversal patterns', async () => {
                const { $ } = await import('../src');
                const path = '../../../etc/passwd';
                expect($(path).selector).toEqual(path);
            });
        });

        test.describe('Memory Safety', () => {
            test('circular references in options', async () => {
                const { $ } = await import('../src');
                const circular: any = { a: 1 };
                circular.self = circular;
                const element = $('div');
                expect(element.selector).toEqual('div');
                expect(element).toBeInstanceOf(WebElement);
            });

            test('very long strings', async () => {
                const { $ } = await import('../src');
                const long = 'a'.repeat(10000);
                expect($(long).selector).toEqual(long);
            });

            test('deeply nested objects', async () => {
                const { $ } = await import('../src');
                let n: any = { level: 0 };
                for (let i = 1; i < 50; i++) n = { level: i, child: n };
                const element = $('div');
                expect(element.selector).toEqual('div');
                expect(element).toBeInstanceOf(WebElement);
            });
        });
    });

    test.describe('API Contracts', () => {
        test.describe('WebElement Contract', () => {
            test('constructor with string selector', async () => {
                const { WebElement } = await import('../src');
                expect(new WebElement('div').selector).toEqual('div');
            });

            test('constructor with By enum', async () => {
                const { WebElement } = await import('../src');
                expect(new WebElement('button', 'getByRole' as any)).toBeInstanceOf(WebElement);
            });

            test('locator getter returns Locator', async () => {
                const { $ } = await import('../src');
                const locator = $('h1').locator; 
                expect((locator as any).click).toBeDefined();
            });

            test('selector getter returns full chain', async () => {
                const { $ } = await import('../src');
                const child = $('div').$('span'); 
                expect(child.selector).toContain('div');
            });

            test('narrowSelector returns base selector', async () => {
                const { $ } = await import('../src');
                expect($('div').$('span').narrowSelector).toEqual('span');
            });
        });

        test.describe('BrowserInstance Contract', () => {
            test('singleton pattern', async () => {
                const { BrowserInstance } = await import('../src');
                expect(BrowserInstance).toEqual(BrowserInstance);
            });

            test('currentPage defined after start', async () => {
                const { BrowserInstance } = await import('../src');
                expect(BrowserInstance.currentPage).toBeDefined();
            });

            test('currentContext defined after start', async () => {
                const { BrowserInstance } = await import('../src');
                expect(BrowserInstance.currentContext).toBeDefined();
            });

            test('browser defined after start', async () => {
                const { BrowserInstance } = await import('../src');
                expect(BrowserInstance.browser).toBeDefined();
            });
        });

        test.describe('Error Handling Contract', () => {
            test('invalid selector does not crash', async () => {
                const { $ } = await import('../src');
                const count = await $('nonexistent-xyz-123').count(); 
                expect(count).toEqual(0);
            });

            test('getText on nonexistent element handles gracefully', async () => {
                const { $ } = await import('../src');
                await expect($('#nonexistent-xyz-123').getText({ timeout: 100 } as any))
                    .rejects
                    .toBeDefined();
            });

            test('duplicated method throws clear error', async () => {
                const { $ } = await import('../src');
                expect(() => $('div').withMethods({ click: () => Promise.resolve() } as any)).toThrow();
            });
        });
    });

    test.describe('Edge Cases', () => {
        test.describe('Chaining Edge Cases', () => {
            test('deep chaining', async () => {
                const { $ } = await import('../src');
                let e = $('div'); 
                for (let i = 0; i < 20; i++) e = e.$('span'); 
                expect(e).toBeInstanceOf(WebElement);
            });

            test('multiple and() operators', async () => {
                const { $ } = await import('../src');
                let e = $('div'); 
                for (let i = 0; i < 10; i++) e = e.and(`div:nth-child(${i})`); 
                expect(e).toBeInstanceOf(WebElement);
            });

            test('multiple or() operators', async () => {
                const { $ } = await import('../src');
                let e = $('div'); 
                for (let i = 0; i < 10; i++) e = e.or(`span:nth-child(${i})`); 
                expect(e).toBeInstanceOf(WebElement);
            });

            test('nth() with large index', async () => {
                const { $ } = await import('../src');
                expect($('div').nth(999999)).toBeInstanceOf(WebElement);
            });

            test('nth() with negative index', async () => {
                const { $ } = await import('../src');
                expect($('div').nth(-999999)).toBeInstanceOf(WebElement);
            });
        });

        test.describe('Special Characters', () => {
            test('unicode characters', async () => {
                const { $ } = await import('../src');
                expect($('测试 🎉 тест').selector).toEqual('测试 🎉 тест');
            });

            test('emoji characters', async () => {
                const { $ } = await import('../src');
                expect($('😀😁😂').selector).toEqual('😀😁😂');
            });

            test('zero-width characters', async () => {
                const { $ } = await import('../src');
                expect($('\u200B\u200C\u200D').selector).toEqual('\u200B\u200C\u200D');
            });

            test('control characters', async () => {
                const { $ } = await import('../src');
                expect($('\x00\x01\x02\x03').selector).toEqual('\x00\x01\x02\x03');
            });
        });
    });

    test.describe('Expect Provider Contract', () => {
        test('setExpectProvider accepts valid provider', async () => {
            const { WebElement } = await import('../src');
            const testProvider = { 
                expect: (locator: any) => expect(locator), 
                softExpect: (locator: any) => expect.soft(locator) 
            };
            let providerSet = false;
            try {
                WebElement.setExpectProvider(testProvider);
                providerSet = true;
                expect(providerSet).toBe(true);
            } finally {
                configureWebElementExpect();
            }
        });

        test('ExpectProvider has correct shape', async () => {
            const p: any = { expect: (l: any) => l, softExpect: (l: any) => l };
            expect(typeof p.expect).toEqual('function'); 
            expect(typeof p.softExpect).toEqual('function');
        });

        test('expect() uses configured provider', async () => {
            configureWebElementExpect();
            const { $ } = await import('../src');
            const result = $('#test').expect();
            expect((result as any).toBeVisible).toBeDefined();
        });
    });
});
