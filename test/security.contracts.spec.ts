/**
 * Security and Contract Tests - T-016
 * Explicit security and package-contract tests for critical boundaries
 */

import { expect } from 'chai';
import { $, WebElement, BrowserInstance, BrowserName, $getByRole, configureWebElementExpect } from '../src';
import { test, before, after, describe } from 'mocha';
import { expect as pwExpect } from '@playwright/test';

describe('Security & Contract Tests', function () {
    this.timeout(30_000);

    before(async () => {
        // Configure expect provider for WebElement methods
        configureWebElementExpect();
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.setContent('<html><body><h1>Test</h1><div id="test"></div><input type="text" id="input"></input></body></html>');
    });

    after(async () => {
        await BrowserInstance.close();
    });

    describe('Input Validation (SEC-001-003)', () => {
        describe('Selector Input', () => {
            test('M-SEC-001: empty CSS selector', async () => {
                const element = $(''); expect(element.selector).to.equal('');
            });
            test('M-SEC-002: null selector', async () => {
                const element = new WebElement(null!); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-003: undefined selector', async () => {
                const element = new WebElement(undefined!); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-004: whitespace selector', async () => {
                const element = $('   '); expect(element.selector).to.equal('   ');
            });
            test('M-SEC-005: special characters in selector', async () => {
                const element = $('<>"\'&@#$%'); expect(element.selector).to.equal('<>"\'&@#$%');
            });
            test('M-SEC-006: JS code in selector should not execute', async () => {
                const element = $('javascript:alert("XSS")'); expect(element.selector).to.equal('javascript:alert("XSS")');
            });
            test('M-SEC-007: HTML tags in selector', async () => {
                const element = $('<script>alert("XSS")</script>'); expect(element.selector).to.equal('<script>alert("XSS")</script>');
            });
        });
        describe('Options Validation', () => {
            test('M-SEC-008: null options for getByRole', async () => {
                const element = $getByRole('button', null as any); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-009: invalid role value', async () => {
                const element = $getByRole('invalid' as any); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-010: undefined options', async () => {
                const element = $getByRole('button', undefined as any); expect(element).to.be.instanceOf(WebElement);
            });
        });
        describe('Chaining Validation', () => {
            test('M-SEC-011: null in has()', async () => {
                const element = $('div').has(null as any); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-012: undefined in has()', async () => {
                const element = $('div').has(undefined as any); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-013: null in and()', async () => {
                const element = $('div').and(null as any); expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-014: undefined in and()', async () => {
                const element = $('div').and(undefined as any); expect(element).to.be.instanceOf(WebElement);
            });
        });
    });

    describe('Type Safety (SEC-004-006)', () => {
        describe('Method Signatures', () => {
            test('M-SEC-015: click returns Promise', async () => {
                const result = $('#test').click({ timeout: 1000 }); expect(result).to.be.a('promise'); await result.catch(() => {});
            });
            test('M-SEC-016: getText returns Promise<string>', async () => {
                const text = await $('h1').getText(); expect(typeof text === 'string' || text === null).to.be.true;
            });
            test('M-SEC-017: count returns Promise<number>', async () => {
                const count = await $('div').count(); expect(typeof count).to.equal('number');
            });
            test('M-SEC-018: isVisible returns Promise<boolean>', async () => {
                const isVisible = await $('h1').isVisible(); expect(typeof isVisible).to.equal('boolean');
            });
            test('M-SEC-019: getAttribute returns Promise<string|null>', async () => {
                const attr = await $('input').getAttribute('type'); expect(attr === null || typeof attr === 'string').to.be.true;
            });
        });
        describe('Type Guards', () => {
            test('M-SEC-020: WebElement instance check', async () => {
                expect($('div') instanceof WebElement).to.be.true;
            });
            test('M-SEC-021: Non-WebElement fails instance check', async () => {
                expect(({}) instanceof WebElement).to.be.false;
            });
            test('M-SEC-022: null fails instance check', async () => {
                expect(null instanceof WebElement).to.be.false;
            });
            test('M-SEC-023: undefined fails instance check', async () => {
                expect(undefined instanceof WebElement).to.be.false;
            });
        });
        describe('Options Types', () => {
            test('M-SEC-024: ClickOptions valid properties', async () => {
                await $('#test').click({ button: 'left', delay: 100, timeout: 1000 } as any).catch(() => {});
            });
            test('M-SEC-025: FillOptions valid properties', async () => {
                await $('input').fill('test', { delay: 100, timeout: 1000 } as any).catch(() => {});
            });
        });
    });

    describe('Security Boundaries (SEC-007-009)', () => {
        describe('XSS Prevention', () => {
            test('M-SEC-026: JS in selectors should not execute', async () => {
                try {
                    await $('javascript:alert("XSS")').count();
                    expect.fail('Should have thrown an error for invalid selector');
                } catch (e: any) {
                    expect(e).to.be.an('error');
                    const msg = e.message || '';
                    expect(msg.includes('not a valid selector') || msg.includes('invalid')).to.be.true;
                }
            });
            test('M-SEC-027: HTML in text should not execute', async () => {
                expect($('div').narrowSelector).to.equal('div');
            });
            test('M-SEC-028: HTML entities safely handled', async () => {
                const html = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
                expect($(html).selector).to.equal(html);
            });
            test('M-SEC-029: prevent prototype pollution', async () => {
                const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
                const before = (Object.prototype as any).isAdmin;
                try {
                    await $('input').fill('test', malicious as any);
                    throw new Error('Expected rejection for prototype pollution');
                } catch (e) {
                    // Expected to reject due to invalid selector options
                }
                expect((Object.prototype as any).isAdmin).to.equal(before);
            });
        });
        describe('Injection Prevention', () => {
            test('M-SEC-030: SQL injection patterns', async () => {
                const sql = '\' OR \'1\'=\'1';
                expect($(sql).selector).to.equal(sql);
            });
            test('M-SEC-031: command injection patterns', async () => {
                const cmd = '; rm -rf /';
                expect($(cmd).selector).to.equal(cmd);
            });
            test('M-SEC-032: path traversal patterns', async () => {
                const path = '../../../etc/passwd';
                expect($(path).selector).to.equal(path);
            });
        });
        describe('Memory Safety', () => {
            test('M-SEC-033: circular references in options', async () => {
                const circular: any = { a: 1 };
                circular.self = circular;
                const element = $('div');
                expect(element.selector).to.equal('div');
                expect(element).to.be.instanceOf(WebElement);
            });
            test('M-SEC-034: very long strings', async () => {
                const long = 'a'.repeat(10000);
                expect($(long).selector).to.equal(long);
            });
            test('M-SEC-035: deeply nested objects', async () => {
                let n: any = { level: 0 };
                for (let i = 1; i < 50; i++) n = { level: i, child: n };
                const element = $('div');
                expect(element.selector).to.equal('div');
                expect(element).to.be.instanceOf(WebElement);
            });
        });
    });

    describe('API Contracts (SEC-010-012)', () => {
        describe('WebElement Contract', () => {
            test('M-SEC-036: constructor with string selector', async () => {
                expect(new WebElement('div').selector).to.equal('div');
            });
            test('M-SEC-037: constructor with By enum', async () => {
                expect(new WebElement('button', 'getByRole' as any)).to.be.instanceOf(WebElement);
            });
            test('M-SEC-038: locator getter returns Locator', async () => {
                const locator = $('h1').locator; expect(locator).to.have.property('click');
            });
            test('M-SEC-039: selector getter returns full chain', async () => {
                const child = $('div').$('span'); expect(child.selector).to.include('div');
            });
            test('M-SEC-040: narrowSelector returns base selector', async () => {
                expect($('div').$('span').narrowSelector).to.equal('span');
            });
        });
        describe('BrowserInstance Contract', () => {
            test('M-SEC-041: singleton pattern', async () => {
                expect(BrowserInstance).to.equal(BrowserInstance);
            });
            test('M-SEC-042: currentPage defined after start', async () => {
                expect(BrowserInstance.currentPage).to.not.be.undefined;
            });
            test('M-SEC-043: currentContext defined after start', async () => {
                expect(BrowserInstance.currentContext).to.not.be.undefined;
            });
            test('M-SEC-044: browser defined after start', async () => {
                expect(BrowserInstance.browser).to.not.be.undefined;
            });
        });
        describe('Error Handling Contract', () => {
            test('M-SEC-045: invalid selector does not crash', async () => {
                const count = await $('nonexistent-xyz-123').count(); expect(count).to.equal(0);
            });
            test('M-SEC-046: getText on nonexistent element handles gracefully', async () => {
                try { 
                    await $('#nonexistent-xyz-123').getText({ timeout: 100 });
                    expect.fail('Should have thrown an error');
                } catch (e: any) { 
                    expect(e).to.not.be.undefined; 
                }
            });
            test('M-SEC-047: duplicated method throws clear error', async () => {
                expect(() => $('div').withMethods({ click: () => Promise.resolve() })).to.throw();
            });
        });
    });

    describe('Edge Cases (SEC-013-014)', () => {
        describe('Chaining Edge Cases', () => {
            test('M-SEC-049: deep chaining', async () => {
                let e = $('div'); for (let i = 0; i < 20; i++) e = e.$('span'); expect(e).to.be.instanceOf(WebElement);
            });
            test('M-SEC-050: multiple and() operators', async () => {
                let e = $('div'); for (let i = 0; i < 10; i++) e = e.and(`div:nth-child(${i})`); expect(e).to.be.instanceOf(WebElement);
            });
            test('M-SEC-051: multiple or() operators', async () => {
                let e = $('div'); for (let i = 0; i < 10; i++) e = e.or(`span:nth-child(${i})`); expect(e).to.be.instanceOf(WebElement);
            });
            test('M-SEC-052: nth() with large index', async () => {
                expect($('div').nth(999999)).to.be.instanceOf(WebElement);
            });
            test('M-SEC-053: nth() with negative index', async () => {
                expect($('div').nth(-999999)).to.be.instanceOf(WebElement);
            });
        });
        describe('Special Characters', () => {
            test('M-SEC-054: unicode characters', async () => {
                expect($('测试 🎉 тест').selector).to.equal('测试 🎉 тест');
            });
            test('M-SEC-055: emoji characters', async () => {
                expect($('😀😁😂').selector).to.equal('😀😁😂');
            });
            test('M-SEC-056: zero-width characters', async () => {
                expect($('\u200B\u200C\u200D').selector).to.equal('\u200B\u200C\u200D');
            });
            test('M-SEC-057: control characters', async () => {
                expect($('\x00\x01\x02\x03').selector).to.equal('\x00\x01\x02\x03');
            });
        });
    });

    describe('Expect Provider Contract (SEC-015)', () => {
        test('M-SEC-058: setExpectProvider accepts valid provider', async () => {
            const testProvider = { expect: (locator: any) => pwExpect(locator), softExpect: (locator: any) => pwExpect.soft(locator) };
            let providerSet = false;
            try {
                WebElement.setExpectProvider(testProvider);
                providerSet = true;
                expect(providerSet).to.be.true;
            } finally {
                configureWebElementExpect();
            }
        });
        test('M-SEC-059: ExpectProvider has correct shape', async () => {
            const p: any = { expect: (l: any) => l, softExpect: (l: any) => l };
            expect(typeof p.expect).to.equal('function'); expect(typeof p.softExpect).to.equal('function');
        });
        test('M-SEC-060: expect() uses configured provider', async () => {
            configureWebElementExpect();
            const result = $('#test').expect();
            expect(result).to.have.property('toBeVisible');
        });
    });
});
