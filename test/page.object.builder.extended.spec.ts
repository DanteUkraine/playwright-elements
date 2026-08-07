import { describe, it } from 'mocha';
import { expect } from 'chai';
import { buildPageObject } from '../src';
import * as pageObjectModule from '../integration.tests/resources/page.object';


describe('buildPageObject - Extended Tests', () => {

    describe('Type Inference', () => {

        it('should correctly infer types from module exports with default options', () => {
            const pages = buildPageObject(pageObjectModule);
            
            expect(pages).to.have.property('home');
            expect(pages.home).to.be.instanceOf(pageObjectModule.HomePage);
            expect(pages.home.welcome).to.be.a('function');
            
            expect(pages).to.have.property('settings');
            expect(pages.settings).to.be.instanceOf(pageObjectModule.SettingsPage);
            expect(pages.settings.getSettings).to.be.a('function');
        });

        it('should maintain type safety with custom suffix', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: 'Element' });
            
            expect(pages).to.have.property('aboutBox');
            expect(pages.aboutBox).to.be.instanceOf(pageObjectModule.AboutBoxElement);
            expect(pages.aboutBox.info).to.be.a('function');
        });

        it('should preserve types with lowerCaseFirst=false', () => {
            const pages = buildPageObject(pageObjectModule, { lowerCaseFirst: false });
            
            expect(pages).to.have.property('Home');
            expect(pages.Home).to.be.instanceOf(pageObjectModule.HomePage);
            
            expect(pages).to.have.property('Settings');
            expect(pages.Settings).to.be.instanceOf(pageObjectModule.SettingsPage);
        });

        it('should correctly map class names to property keys', () => {
            const pages = buildPageObject(pageObjectModule);
            
            expect(pages).to.have.property('home');
            expect(pages).to.have.property('settings');
        });

        it('should maintain method signatures from classes', () => {
            const pages = buildPageObject(pageObjectModule);
            
            expect(pages.home.welcome).to.be.a('function');
            expect(pages.settings.getSettings).to.be.a('function');
        });
    });

    describe('Error Handling', () => {

        it('should handle module with no exported classes', () => {
            const module = {
                someFunction: () => 'function',
                someValue: 'value',
                someNumber: 42
            };
            
            const pages = buildPageObject(module);
            
            expect(pages).to.be.an('object');
            expect(Object.keys(pages)).to.have.lengthOf(0);
        });

        it('should handle module with non-class exports', () => {
            const module = {
                stringExport: 'string',
                numberExport: 123,
                functionExport: () => 'function',
                objectExport: { key: 'value' },
                arrayExport: [1, 2, 3]
            };
            
            const pages = buildPageObject(module);
            
            expect(pages).to.be.an('object');
            expect(Object.keys(pages)).to.have.lengthOf(0);
        });

        it('should handle empty module', () => {
            const module = {};
            
            const pages = buildPageObject(module);
            
            expect(pages).to.be.an('object');
            expect(Object.keys(pages)).to.have.lengthOf(0);
        });

        it('should handle module with null values', () => {
            const module = {
                nullExport: null,
                undefinedExport: undefined
            };
            
            const pages = buildPageObject(module);
            
            expect(pages).to.be.an('object');
            expect(Object.keys(pages)).to.have.lengthOf(0);
        });

        it('should handle invalid module input (null)', () => {
            expect(() => buildPageObject(null as any)).to.throw(TypeError);
        });

        it('should handle invalid module input (undefined)', () => {
            expect(() => buildPageObject(undefined as any)).to.throw(TypeError);
        });
    });

    describe('Class Filtering Logic', () => {

        it('should only instantiate classes ending with specified suffix', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: 'Page' });
            
            expect(pages).to.have.property('home');
            expect(pages).to.have.property('settings');
            expect(pages).not.to.have.property('aboutBoxElement');
        });

        it('should instantiate all classes when suffix is empty string', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: '' });
            
            expect(pages).to.have.property('homePage');
            expect(pages).to.have.property('settingsPage');
            expect(pages).to.have.property('aboutBoxElement');
        });

        it('should handle classes without suffix when suffix is empty', () => {
            const pages = buildPageObject(pageObjectModule, { suffix: '' });
            
            expect(pages.homePage).to.be.instanceOf(pageObjectModule.HomePage);
            expect(pages.settingsPage).to.be.instanceOf(pageObjectModule.SettingsPage);
            expect(pages.aboutBoxElement).to.be.instanceOf(pageObjectModule.AboutBoxElement);
        });
    });
});
