import {$, BrowserInstance, BrowserName} from "../src";
import {test} from "mocha";
import chai, {expect} from "chai";
import path from "path";
import chaiAsPromised from 'chai-as-promised'

const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;

chai.use(chaiAsPromised);

describe('Web Element predicates', function (this: Mocha.Suite) {
    this.timeout(10_000);

    before(async () => {
        await BrowserInstance.start(BrowserName.CHROME);
        await BrowserInstance.startNewPage();
        await BrowserInstance.currentPage.goto(localFilePath);
        await BrowserInstance.currentPage.waitForSelector('h1');
    })

    after(async () => {
        await BrowserInstance.close();
    })

    test('exists positive', (done) => {
        expect($(`h1`).exists()).to.become(true).and.notify(done);
    })

    test('exists negative', (done) => {
        expect($(`h3`).exists()).to.become(false).and.notify(done);
    })

    test('not exists positive', (done) => {
        expect($(`h3`).notExists()).to.become(true).and.notify(done);
    })

    test('not exists negative', (done) => {
        expect($(`h2`).notExists()).to.become(false).and.notify(done);
    })

    test('visibility positive', (done) => {
        expect($(`h1`).visible()).to.become(true).and.notify(done);
    })

    test('visibility negative', (done) => {
        expect($(`h2`).visible()).to.become(false).and.notify(done);
    })

    test('hidden positive', (done) => {
        expect($(`h2`).hidden()).to.become(true).and.notify(done);
    })

    test('hidden negative', (done) => {
        expect($(`h1`).hidden()).to.become(false).and.notify(done);
    })

    test('enabled positive', (done) => {
        expect($(`#enabled-field`).enabled()).to.become(true).and.notify(done);
    })

    test('enabled negative', (done) => {
        expect($(`#disabled-field`).enabled()).to.become(false).and.notify(done);
    })

    test('disabled positive', (done) => {
        expect($(`#disabled-field`).disable()).to.become(true).and.notify(done);
    })

    test('disabled negative', (done) => {
        expect($(`#enabled-field`).disable()).to.become(false).and.notify(done);
    })

    test('checked positive', (done) => {
        expect($(`#checked`).checked()).to.become(true).and.notify(done);
    })

    test('checked negative', (done) => {
        expect($(`#unchecked`).checked()).to.become(false).and.notify(done);
    })

    test('unchecked positive', (done) => {
        expect($(`#unchecked`).unchecked()).to.become(true).and.notify(done);
    })

    test('unchecked negative', (done) => {
        expect($(`#checked`).unchecked()).to.become(false).and.notify(done);
    })

});
