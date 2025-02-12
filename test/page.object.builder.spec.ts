import { describe, it } from 'mocha';
import { expect } from 'chai';
import { buildPageObject } from '../src';
import * as pageObjectModule from '../integration.tests/resources/page.object';
import { HomePage, SettingsPage, AboutBoxElement } from '../integration.tests/resources/page.object';

describe('buildPageObject', () => {
    it('should return instances of pages using default options (suffix "Page", lowerCaseFirst true)', () => {
        const pages = buildPageObject(pageObjectModule);

        expect(pages).to.have.property('home');
        expect(pages.home).to.be.instanceOf(HomePage);
        expect(pages.home).to.respondTo('welcome');

        expect(pages).to.have.property('settings');
        expect(pages.settings).to.be.instanceOf(SettingsPage);
        expect(pages.settings).to.respondTo('getSettings');

        expect(Object.keys(pages)).to.not.have.property('aboutBoxElement');
    });

    it('should return instances of pages with a custom suffix "Box" and preserve case (lowerCaseFirst false)', () => {
        const pages = buildPageObject(pageObjectModule, { suffix: 'Element', lowerCaseFirst: false });

        expect(pages).to.have.property('AboutBox');
        expect(pages.AboutBox).to.be.instanceOf(AboutBoxElement);
        expect(pages.AboutBox).to.respondTo('info');

        expect(pages).to.not.have.property('home');
        expect(pages).to.not.have.property('HomePage');
        expect(pages).to.not.have.property('homePage');
        expect(pages).to.not.have.property('settings');
        expect(pages).to.not.have.property('SettingsPage');
        expect(pages).to.not.have.property('settingsPage');
    });

    it('should return all classes if suffix is an empty string (with lowerCaseFirst true)', () => {
        const pages = buildPageObject(pageObjectModule, { suffix: '', lowerCaseFirst: true });

        expect(pages).to.have.property('homePage');
        expect(pages.homePage).to.be.instanceOf(HomePage);
        expect(pages.homePage).to.respondTo('welcome');

        expect(pages).to.have.property('settingsPage');
        expect(pages.settingsPage).to.be.instanceOf(SettingsPage);
        expect(pages.settingsPage).to.respondTo('getSettings');

        expect(pages).to.have.property('aboutBoxElement');
        expect(pages.aboutBoxElement).to.be.instanceOf(AboutBoxElement);
        expect(pages.aboutBoxElement).to.respondTo('info');
    });
});
