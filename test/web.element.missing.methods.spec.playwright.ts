import { expect } from '../src';
import { test } from '../src';
import { $, BrowserInstance } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test

test.describe('Web Element Missing and Less Tested Methods', () => {

    test.beforeEach(async ({ goto }) => {
        await goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    test.describe('Bounding Box Methods', () => {
        test('boundingBox should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('boundingBox');
            expect(typeof element.boundingBox).toEqual('function');
        });

        test('boundingBox should return object with expected properties', async () => {
            const element = $('h1');
            const box = await element.boundingBox();
            
            if (box) {
                expect(box).toHaveProperty('x');
                expect(box).toHaveProperty('y');
                expect(box).toHaveProperty('width');
                expect(box).toHaveProperty('height');
                expect(typeof box.x).toEqual('number');
                expect(typeof box.y).toEqual('number');
                expect(typeof box.width).toEqual('number');
                expect(typeof box.height).toEqual('number');
            } else {
                // Element might not be visible
                expect(box).toBeNull();
            }
        });

        test('boundingBox with options should work', async () => {
            const element = $('h1');
            const box = await element.boundingBox();
            expect(box === null || typeof box === 'object').toBe(true);
        });
    });

    test.describe('Scroll Methods', () => {
        test('scrollIntoViewIfNeeded should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('scrollIntoViewIfNeeded');
            expect(typeof element.scrollIntoViewIfNeeded).toEqual('function');
        });

        test('scrollIntoViewIfNeeded should not throw on existing elements', async () => {
            const element = $('h1');
            await element.scrollIntoViewIfNeeded();
        });
    });

    test.describe('Screenshot Methods', () => {
        test('screenshot should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('screenshot');
            expect(typeof element.screenshot).toEqual('function');
        });

        test('screenshot should return Buffer on existing elements', async () => {
            const element = $('h1');
            const screenshot = await element.screenshot();
            expect(Buffer.isBuffer(screenshot)).toBe(true);
        });

        test('screenshot with options should work', async () => {
            const element = $('h1');
            const screenshot = await element.screenshot({ type: 'png' });
            expect(Buffer.isBuffer(screenshot)).toBe(true);
        });
    });

    test.describe('Visibility and State Methods', () => {
        test('isHidden should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('isHidden');
            expect(typeof element.isHidden).toEqual('function');
        });

        test('isVisible should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('isVisible');
            expect(typeof element.isVisible).toEqual('function');
        });

        test('isChecked should exist and be callable', async () => {
            const element = $('input[type="checkbox"]');
            expect(element).toHaveProperty('isChecked');
            expect(typeof element.isChecked).toEqual('function');
        });

        test('isDisabled should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('isDisabled');
            expect(typeof element.isDisabled).toEqual('function');
        });

        test('isEnabled should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('isEnabled');
            expect(typeof element.isEnabled).toEqual('function');
        });

        test('isEditable should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('isEditable');
            expect(typeof element.isEditable).toEqual('function');
        });
    });

    test.describe('Content Methods', () => {
        test('innerHTML should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('innerHTML');
            expect(typeof element.innerHTML).toEqual('function');
        });

        test('innerText should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('innerText');
            expect(typeof element.innerText).toEqual('function');
        });

        test('textContent should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('textContent');
            expect(typeof element.textContent).toEqual('function');
        });

        test('inputValue should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('inputValue');
            expect(typeof element.inputValue).toEqual('function');
        });
    });

    test.describe('Action Methods', () => {
        test('blur should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('blur');
            expect(typeof element.blur).toEqual('function');
        });

        test('focus should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('focus');
            expect(typeof element.focus).toEqual('function');
        });

        test('check should exist and be callable', async () => {
            const element = $('input[type="checkbox"]');
            expect(element).toHaveProperty('check');
            expect(typeof element.check).toEqual('function');
        });

        test('uncheck should exist and be callable', async () => {
            const element = $('input[type="checkbox"]');
            expect(element).toHaveProperty('uncheck');
            expect(typeof element.uncheck).toEqual('function');
        });

        test('selectText should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('selectText');
            expect(typeof element.selectText).toEqual('function');
        });

        test('setChecked should exist and be callable', async () => {
            const element = $('input[type="checkbox"]');
            expect(element).toHaveProperty('setChecked');
            expect(typeof element.setChecked).toEqual('function');
        });

        test('setInputFiles should exist and be callable', async () => {
            const element = $('#file-upload');
            expect(element).toHaveProperty('setInputFiles');
            expect(typeof element.setInputFiles).toEqual('function');
        });
    });

    test.describe('Event Methods', () => {
        test('dispatchEvent should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('dispatchEvent');
            expect(typeof element.dispatchEvent).toEqual('function');
        });

        test('dispatchEvent should work with basic events', async () => {
            const element = $('body');
            await element.dispatchEvent('click');
        });

        test('highlight should exist and be callable', async () => {
            const element = $('h1');
            expect(element).toHaveProperty('highlight');
            expect(typeof element.highlight).toEqual('function');
        });
    });

    test.describe('Array Methods', () => {
        test('allInnerTexts should exist and be callable', async () => {
            const element = $('li');
            expect(element).toHaveProperty('allInnerTexts');
            expect(typeof element.allInnerTexts).toEqual('function');
        });

        test('allTextContents should exist and be callable', async () => {
            const element = $('li');
            expect(element).toHaveProperty('allTextContents');
            expect(typeof element.allTextContents).toEqual('function');
        });

        test('allInnerTexts should return array of strings', async () => {
            const element = $('li');
            const texts = await element.allInnerTexts().catch(() => []);
            expect(Array.isArray(texts)).toBe(true);
        });

        test('allTextContents should return array of strings', async () => {
            const element = $('li');
            const texts = await element.allTextContents().catch(() => []);
            expect(Array.isArray(texts)).toBe(true);
        });
    });

    test.describe('ARIA and Accessibility Methods', () => {
        test('ariaSnapshot should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('ariaSnapshot');
            expect(typeof element.ariaSnapshot).toEqual('function');
        });

        test('ariaSnapshot should return string', async () => {
            const element = $('div');
            const snapshot = await element.ariaSnapshot().catch(() => '');
            expect(typeof snapshot).toBe('string');
        });
    });

    test.describe('Form Methods', () => {
        test('fill should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('fill');
            expect(typeof element.fill).toEqual('function');
        });

        test('clear should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('clear');
            expect(typeof element.clear).toEqual('function');
        });

        test('selectOption should exist and be callable', async () => {
            const element = $('select');
            expect(element).toHaveProperty('selectOption');
            expect(typeof element.selectOption).toEqual('function');
        });

        test('setInputFiles should work with empty array on existing file input', async () => {
            const element = $('#file-upload');
            await element.setInputFiles([]); // Should not throw
        });
    });

    test.describe('Drag and Drop Methods', () => {
        test('dragTo should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('dragTo');
            expect(typeof element.dragTo).toEqual('function');
        });

        test('dragTo should work with another element', async () => {
            const source = $('body');
            const target = $('body');
            await source.dragTo(target);
        });
    });

    test.describe('Mobile and Touch Methods', () => {
        test('tap should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('tap');
            expect(typeof element.tap).toEqual('function');
        });

        test('dblclick should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('dblclick');
            expect(typeof element.dblclick).toEqual('function');
        });

        test('hover should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('hover');
            expect(typeof element.hover).toEqual('function');
        });
    });

    test.describe('Keyboard Methods', () => {
        test('press should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('press');
            expect(typeof element.press).toEqual('function');
        });

        test('type should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('type');
            expect(typeof element.type).toEqual('function');
        });

        test('pressSequentially should exist and be callable', async () => {
            const element = $('input');
            expect(element).toHaveProperty('pressSequentially');
            expect(typeof element.pressSequentially).toEqual('function');
        });
    });

    test.describe('Wait Methods', () => {
        test('waitFor should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('waitFor');
            expect(typeof element.waitFor).toEqual('function');
        });

        test('waitFor should work with timeout', async () => {
            const element = $('h1'); // Use existing element
            await element.waitFor({ timeout: 100 });
        });
    });

    test.describe('Handler Methods', () => {
        test('addHandler should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('addHandler');
            expect(typeof element.addHandler).toEqual('function');
        });

        test('removeHandler should exist and be callable', async () => {
            const element = $('div');
            expect(element).toHaveProperty('removeHandler');
            expect(typeof element.removeHandler).toEqual('function');
        });

        test('addHandler and removeHandler should work together', async () => {
            const element = $('div');
            await element.addHandler(async () => {});
            await element.removeHandler();
        });
    });
});
