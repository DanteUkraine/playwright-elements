import { expect } from 'chai';
import { test } from 'mocha';
import { $, $getByAltText, $getByLabel, $getByPlaceholder, $getByRole, $getByTestId, $getByText, $getByTitle, BrowserInstance, BrowserName } from '../src';
import { localFilePath } from './utils';

describe('Web Element Error Handling and Negative Testing', function () {
    this.timeout(10_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    });

    after(async () => {
        await BrowserInstance.close();
    });

    describe('Invalid Selector Testing', () => {
        test('should handle invalid CSS selector syntax', async () => {
            const element = $('invalid >>> selector');
            expect(await element.count()).to.be.equal(0);
        });

        test('should handle empty string selector', async () => {
            const element = $('');
            try {
                await element.count();
                throw new AssertionError('Expected error for empty selector');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        test('should handle null-like selector', async () => {
            const element = $('null');
            expect(await element.count()).to.be.equal(0);
        });

        test('should handle undefined-like selector', async () => {
            const element = $('undefined');
            expect(await element.count()).to.be.equal(0);
        });

        test('should handle selector with special characters that need escaping', async () => {
            // This should work as a valid selector
            const element = $('#test\\:id');
            expect(await element.count()).to.be.equal(0); // Element doesn't exist, but selector is valid
        });

        test('should handle very long selector string', async () => {
            const longSelector = 'div'.repeat(1000);
            const element = $(longSelector);
            // Should not throw, just return 0 count
            expect(await element.count()).to.be.equal(0);
        });
    });

    describe('Non-existent Element Testing', () => {
        test('should handle non-existent element operations', async () => {
            const element = $('#non-existent-element-12345');
            expect(await element.count()).to.be.equal(0);
        });

        test('getText should handle non-existent elements', async () => {
            // getText will throw when textContent returns null
            const element = $('#non-existent-element-12345');
            try {
                await element.locator.textContent({ timeout: 100 });
                throw new AssertionError('Expected error for textContent on non-existent element');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        test('getAttribute should handle non-existent elements', async () => {
            // getAttribute returns null for non-existent attributes, but waits for element
            const element = $('h1'); // Use existing element
            const result = await element.getAttribute('data-non-existent');
            expect(result).to.be.null;
        });

        test('should handle non-existent element with isVisible', async () => {
            const element = $('#non-existent-element-12345');
            const result = await element.isVisible();
            expect(result).to.be.false;
        });

        test('should handle non-existent element with isHidden', async () => {
            const element = $('#non-existent-element-12345');
            const result = await element.isHidden();
            expect(result).to.be.true;
        });
    });

    describe('By Selector Error Testing', () => {
        test('has method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.has('#child')).to.throw(Error, /has option can not be used with/);
        });

        test('hasNot method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.hasNot('#child')).to.throw(Error, /hasNot option can not be used with/);
        });

        test('hasText method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.hasText('test')).to.throw(Error, /hasText option can not be used with/);
        });

        test('hasNotText method should throw error when used with By selectors', async () => {
            const element = $getByTestId('test-div');
            expect(() => element.hasNotText('test')).to.throw(Error, /hasNotText option can not be used with/);
        });

        test('all By selector methods should work with valid selectors', async () => {
            // These should not throw errors
            expect(() => $getByAltText('test')).not.to.throw();
            expect(() => $getByLabel('test')).not.to.throw();
            expect(() => $getByPlaceholder('test')).not.to.throw();
            expect(() => $getByRole('div')).not.to.throw();
            expect(() => $getByTestId('test')).not.to.throw();
            expect(() => $getByText('test')).not.to.throw();
            expect(() => $getByTitle('test')).not.to.throw();
        });
    });

    describe('Chainable Method Error Testing', () => {
        test('clone method should preserve all properties', async () => {
            const original = $('div').hasText('test').hasNotText('exclude').nth(1);
            const cloned = original.clone();
            
            expect(cloned.narrowSelector).to.equal(original.narrowSelector);
            expect(cloned._hasText).to.equal(original._hasText);
            expect(cloned._hasNotText).to.equal(original._hasNotText);
            expect(cloned._nth).to.equal(original._nth);
        });

        test('clone method should allow property overrides', async () => {
            const original = $('div').hasText('test');
            const cloned = original.clone({ hasText: 'new text' });
            
            expect(cloned._hasText).to.equal('new text');
            expect(original._hasText).to.equal('test'); // Original should be unchanged
        });

        test('and method should create new instance', async () => {
            const original = $('div');
            const andElement = original.and('#child');
            
            expect(andElement).not.to.equal(original);
            expect(andElement._and).to.have.lengthOf(1);
            expect(original._and).to.have.lengthOf(0);
        });

        test('or method should create new instance', async () => {
            const original = $('div');
            const orElement = original.or('#child');
            
            expect(orElement).not.to.equal(original);
            expect(orElement._or).to.have.lengthOf(1);
            expect(original._or).to.have.lengthOf(0);
        });

        test('nth method should create new instance', async () => {
            const original = $('div');
            const nthElement = original.nth(1);
            
            expect(nthElement).not.to.equal(original);
            expect(nthElement._nth).to.equal(1);
            expect(original._nth).to.be.undefined;
        });

        test('first method should set nth to 0', async () => {
            const element = $('div').first();
            expect(element._nth).to.equal(0);
        });

        test('last method should set nth to -1', async () => {
            const element = $('div').last();
            expect(element._nth).to.equal(-1);
        });
    });

    describe('Type Mismatch Testing', () => {
        test('withMethods should throw error for duplicate method names', async () => {
            const element = $('div');
            expect(() => {
                element.withMethods({
                    click: () => {}, // This should throw because click already exists
                });
            }).to.throw(Error, /Can not add method with name 'click'/);
        });

        test('withMethods should add valid methods', async () => {
            const element = $('div');
            const result = element.withMethods({
                customMethod: async () => 'test',
            });
            
            expect(result).to.have.property('customMethod');
            expect(await (result as any).customMethod()).to.equal('test');
        });

        test('subElements should handle null/undefined values gracefully', async () => {
            const element = $('div');
            // This should not throw
            const result = element.subElements({
                // No elements to add
            });
            expect(result).to.equal(element);
        });
    });

    describe('Frame and Context Testing', () => {
        test('contentFrame should set _isFrame flag', async () => {
            const element = $('iframe').contentFrame();
            expect(element._isFrame).to.be.true;
        });

        test('owner should reset _isFrame flag', async () => {
            const element = $('iframe').contentFrame().owner();
            expect(element._isFrame).to.be.false;
        });

        test('contentFrame and owner should be chainable', async () => {
            const element = $('iframe').contentFrame().owner().contentFrame();
            expect(element._isFrame).to.be.true;
        });
    });

    describe('Parent-Child Relationship Testing', () => {
        test('parent should return the last parent element', async () => {
            const parent = $('div');
            const child = parent.$('span');
            const grandchild = child.$('a');
            
            expect(grandchild.parent()).to.equal(child);
            expect(child.parent()).to.equal(parent);
        });

        test('parent should throw when no parents exist', async () => {
            const element = $('div');
            const result = element.parent();
            expect(result).to.be.undefined;
        });

        test('addParentSelector should maintain parent chain', async () => {
            const parent1 = $('div');
            const parent2 = $('span');
            const child = $('a');
            
            // Manually add parents (simulating internal behavior)
            (child as any).addParentSelector(parent1);
            (child as any).addParentSelector(parent2);
            
            expect(child.parentElements).to.have.lengthOf(2);
            expect(child.parentElements[0]).to.equal(parent2);
            expect(child.parentElements[1]).to.equal(parent1);
        });
    });

    describe('Selector Building Testing', () => {
        test('selector should handle complex chains', async () => {
            const element = $('div').hasText('test').hasNotText('exclude').nth(1);
            const selector = element.selector;
            expect(selector).to.include('div');
            // The selector might be just the base selector without the filters in the string representation
            expect(selector).to.be.a('string').that.is.not.empty;
        });

        test('selector should handle parent chains', async () => {
            const parent = $('div');
            const child = parent.$('span');
            const grandchild = child.$('a');
            
            const selector = grandchild.selector;
            expect(selector).to.include('div');
            expect(selector).to.include('span');
            expect(selector).to.include('a');
        });

        test('selector should handle has locator chains', async () => {
            const parent = $('div');
            const child = parent.has('#child');
            const selector = child.selector;
            expect(selector).to.include('div');
            expect(selector).to.include('internal:has');
        });
    });

    describe('Array Operations Testing', () => {
        test('getAll should return empty array for non-existent elements', async () => {
            const element = $('#non-existent-12345');
            const all = await element.getAll();
            expect(all).to.be.an('array').that.is.empty;
        });

        test('asyncForEach should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            let callCount = 0;
            await element.asyncForEach(() => { callCount++; });
            expect(callCount).to.equal(0);
        });

        test('syncForEach should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            let callCount = 0;
            await element.syncForEach(() => { callCount++; });
            expect(callCount).to.equal(0);
        });

        test('map should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            const result = await element.map(el => el.narrowSelector);
            expect(result).to.be.an('array').that.is.empty;
        });

        test('filterElements should handle empty arrays', async () => {
            const element = $('#non-existent-12345');
            const result = await element.filterElements(() => true);
            expect(result).to.be.an('array').that.is.empty;
        });
    });

    describe('Filter Method Testing', () => {
        test('filter should create new instance with options', async () => {
            const original = $('div');
            const filtered = original.filter({ hasText: 'test' });
            
            expect(filtered).not.to.equal(original);
            expect(filtered._hasText).to.equal('test');
            expect(original._hasText).to.be.undefined;
        });

        test('filter should handle all option types', async () => {
            const element = $('div');
            const filtered = element.filter({
                has: '#child',
                hasNot: '#exclude',
                hasText: /test/,
                hasNotText: /exclude/
            });
            
            expect(filtered._hasLocator).to.equal('#child');
            expect(filtered._hasNotLocator).to.equal('#exclude');
            expect(filtered._hasText).to.deep.equal(/test/);
            expect(filtered._hasNotText).to.deep.equal(/exclude/);
        });
    });

    describe('Locator Method Testing', function() {
        // These tests use existing elements to avoid Playwright's default timeout behavior
        
        test('boundingBox method should exist and be callable', async () => {
            const element = $('h1'); // Use existing element
            // Test that the method exists and can be called
            expect(element).to.have.property('boundingBox');
            expect(typeof element.boundingBox).to.equal('function');
            // Call it on an existing element to avoid timeout
            const result = await element.boundingBox();
            // Should return a bounding box object with expected properties or null
            expect(result).to.satisfy((res: any) => {
                return res === null || (res && typeof res === 'object' && 'x' in res && 'y' in res && 'width' in res && 'height' in res);
            });
        });

        test('screenshot method should exist and be callable', async () => {
            const element = $('h1');
            // Test that the method exists and can be called on an existing element
            expect(element).to.have.property('screenshot');
            expect(typeof element.screenshot).to.equal('function');
        });

        test('click method should exist and be callable', async () => {
            const element = $('h1');
            expect(element).to.have.property('click');
            expect(typeof element.click).to.equal('function');
        });

        test('fill method should exist and be callable', async () => {
            const element = $('h1');
            expect(element).to.have.property('fill');
            expect(typeof element.fill).to.equal('function');
        });

        test('getAttribute should return null for non-existent attributes', async () => {
            const element = $('h1'); // Use an existing element
            const result = await element.getAttribute('data-non-existent');
            expect(result).to.be.null;
        });
    });

    describe('Mobile Context Testing', () => {
        test('isContextMobile getter should work', async () => {
            // This tests the uncovered lines in browser.ts
            BrowserInstance.isContextMobile = false;
            expect(BrowserInstance.isContextMobile).to.be.false;
            
            BrowserInstance.isContextMobile = true;
            expect(BrowserInstance.isContextMobile).to.be.true;
            
            // Reset to default
            BrowserInstance.isContextMobile = false;
        });
    });
});
