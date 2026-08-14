import { test, expect } from '../src';
import { buildPageObject } from '../src';
import * as pageObjectModule from '../integration.tests/resources/page.object';

// Migrated from mocha/chai to @playwright/test
// This file doesn't need browser as it's testing buildPageObject function only

test.describe('buildPageObject - Extended Tests', () => {

    test.describe('Type Inference', () => {

        test('should correctly infer types from module exports with default options', () => {
            const pages = buildPageObject(pageObjectModule);
            
            expect(pages).toHaveProperty('home');
            expect(pages.home).toBeInstanceOf(pageObjectModule.HomePage);
            expect(typeof (pages.home as any).welcome).toBe('function');
            
            expect(pages).toHaveProperty('settings');
            expect(pages.settings).toBeInstanceOf(pageObjectModule.SettingsPage);
            expect(typeof (pages.settings as any).getSettings).toBe('function');
        });

        test('should maintain type safety with custom suffix', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: 'Element' });
            
            expect(pages).toHaveProperty('aboutBox');
            expect(pages.aboutBox).toBeInstanceOf(pageObjectModule.AboutBoxElement);
            expect(typeof (pages.aboutBox as any).info).toBe('function');
        });

        test('should preserve types with lowerCaseFirst=false', () => {
            const pages = buildPageObject(pageObjectModule, { lowerCaseFirst: false });
            
            expect(pages).toHaveProperty('Home');
            expect(pages.Home).toBeInstanceOf(pageObjectModule.HomePage);
            
            expect(pages).toHaveProperty('Settings');
            expect(pages.Settings).toBeInstanceOf(pageObjectModule.SettingsPage);
        });

        test('should correctly map class names to property keys', () => {
            const pages = buildPageObject(pageObjectModule);
            
            expect(pages).toHaveProperty('home');
            expect(pages).toHaveProperty('settings');
        });

        test('should maintain method signatures from classes', () => {
            const pages = buildPageObject(pageObjectModule);
            
            expect(typeof (pages.home as any).welcome).toBe('function');
            expect(typeof (pages.settings as any).getSettings).toBe('function');
        });
    });

    test.describe('Error Handling', () => {

        test('should handle module with no exported classes', () => {
            const module = {
                someFunction: () => 'function',
                someValue: 'value',
                someNumber: 42
            };
            
            const pages = buildPageObject(module);
            
            expect(pages).toBeInstanceOf(Object);
            expect(Object.keys(pages)).toHaveLength(0);
        });

        test('should handle module with non-class exports', () => {
            const module = {
                stringExport: 'string',
                numberExport: 123,
                functionExport: () => 'function',
                objectExport: { key: 'value' },
                arrayExport: [1, 2, 3]
            };
            
            const pages = buildPageObject(module);
            
            expect(pages).toBeInstanceOf(Object);
            expect(Object.keys(pages)).toHaveLength(0);
        });

        test('should handle empty module', () => {
            const module = {};
            
            const pages = buildPageObject(module);
            
            expect(pages).toBeInstanceOf(Object);
            expect(Object.keys(pages)).toHaveLength(0);
        });

        test('should handle module with null values', () => {
            const module = {
                nullExport: null,
                undefinedExport: undefined
            };
            
            const pages = buildPageObject(module);
            
            expect(pages).toBeInstanceOf(Object);
            expect(Object.keys(pages)).toHaveLength(0);
        });

        test('should handle invalid module input (null)', () => {
            expect(() => buildPageObject(null as any)).toThrow(TypeError);
        });

        test('should handle invalid module input (undefined)', () => {
            expect(() => buildPageObject(undefined as any)).toThrow(TypeError);
        });
    });

    test.describe('Class Filtering Logic', () => {

        test('should only instantiate classes ending with specified suffix', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: 'Page' });
            
            expect(pages).toHaveProperty('home');
            expect(pages).toHaveProperty('settings');
            expect(pages).not.toHaveProperty('aboutBoxElement');
        });

        test('should instantiate all classes when suffix is empty string', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: '' });
            
            expect(pages).toHaveProperty('homePage');
            expect(pages).toHaveProperty('settingsPage');
            expect(pages).toHaveProperty('aboutBoxElement');
        });

        test('should handle classes without suffix when suffix is empty', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: '' });
            
            expect(pages.homePage).toBeInstanceOf(pageObjectModule.HomePage);
            expect(pages.settingsPage).toBeInstanceOf(pageObjectModule.SettingsPage);
            expect(pages.aboutBoxElement).toBeInstanceOf(pageObjectModule.AboutBoxElement);
        });
    });
});
