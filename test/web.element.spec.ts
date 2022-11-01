import chai, {expect} from 'chai';
import {test} from "mocha";
import {$, BrowserInstance, BrowserName} from '../src';
import {AssertionError} from "assert";
import chaiAsPromised from 'chai-as-promised'
import * as path from 'path';

const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;

chai.use(chaiAsPromised)

describe('Web Element chainable selectors', () => {

    test('should have a child', () => {
        expect($(`.class`).child(".child_class").selector).is.equal(`.class >> .child_class`);
    });

    test('should have a visible', () => {
        expect($(`.class`).withVisible().selector).is.equal(`.class >> visible=true`);
    });

    test('should point on first element', () => {
        expect($(`.class`).first().selector).is.equal(`.class >> nth=0`);
    });

    test('should point on last element', () => {
        expect($(`.class`).last().selector).is.equal(`.class >> nth=-1`);
    });

    test('should point on element with text', () => {
        expect($(`.class`).withText("text").selector).is.equal(`.class >> text=text`);
    });

    test('should point on element where is text', () => {
        expect($(`.class`).whereTextIs("text").selector).is.equal(`.class >> text="text"`);
    });

});

describe('Web Element augmentation', () => {

    test('should have a sub elements', () => {
        const element = $(`.parent`)
            .subElements({
                child: $(`.child`)
                    .subElements({
                        innerChild: $(`.innerChild`)
                    })
            });
        expect(element).to.have.property('child');
        expect(element.child).to.have.property('innerChild');
        expect(element.narrowSelector).to.be.equal('.parent')
    });

    test('should reuse sub elements', () => {
        const commonChild = {
            child: $(`.child`)
                .subElements({
                    innerChild: $(`.innerChild`)
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        const element2 = $(`.parent2`).subElements(commonChild);
        expect(element1.child.selector).is.equal(`.parent1 >> .child`);
        expect(element2.child.selector).is.equal(`.parent2 >> .child`);
        expect(element1.child.innerChild.selector).is.equal(`.parent1 >> .child >> .innerChild`);
        expect(element2.child.innerChild.selector).is.equal(`.parent2 >> .child >> .innerChild`);
    });

    test('should reuse chainable sub elements', () => {
        const commonChild = {
            child: $(`.child`).withVisible()
                .subElements({
                    innerChild: $(`.innerChild`).withVisible()
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        const element2 = $(`.parent2`).subElements(commonChild);
        expect(element1.child.selector).is.equal(`.parent1 >> .child >> visible=true`);
        expect(element2.child.selector).is.equal(`.parent2 >> .child >> visible=true`);
        expect(element1.child.innerChild.selector).is.equal(`.parent1 >> .child >> visible=true >> .innerChild >> visible=true`);
        expect(element2.child.innerChild.selector).is.equal(`.parent2 >> .child >> visible=true >> .innerChild >> visible=true`);
    });

    test('chainable sub elements should not mutate original element', () => {
        const commonChild = {
            child: $(`.child`)
                .subElements({
                    innerChild: $(`.innerChild`)
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        expect(element1.child.withVisible().selector).is.equal(`.parent1 >> .child >> visible=true`);
        expect(element1.child.selector).is.equal(`.parent1 >> .child`);
        expect(element1.child.innerChild.withVisible().selector).is.equal(`.parent1 >> .child >> .innerChild >> visible=true`);
        expect(element1.child.innerChild.selector).is.equal(`.parent1 >> .child >> .innerChild`);
    });

    test('should have additional method', () => {
        expect($(`.selector`)
            .withMethods({
                additionalMethod() {

                }
            })).to.have.property('additionalMethod');
    });

    test('should throw on duplicated additional method', () => {
        expect(() => $(`.selector`)
            .withMethods({
                visible() {

                }
            })).to.throw('Can not add method with name \'visible\' because such method already exists.');
    });

});

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

describe('Web Element asserts', function (this: Mocha.Suite) {
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

    test(`expect that is visible positive`, (done) => {
        expect($(`h1`).asserts().expectThatIsVisible()).to.be.fulfilled.and.notify(done);
    })

    test(`expect that is visible negative`, (done) => {
        expect($(`h2`).asserts().expectThatIsVisible())
            .to.be.rejectedWith(AssertionError, `Selector: h2 is not visible.`).and.notify(done);
    })

    test(`expect that is not visible positive`, (done) => {
        expect($(`h2`).asserts().expectThatIsNotVisible()).to.be.fulfilled.and.notify(done);
    })

    test(`expect that is not visible negative`, (done) => {
        expect($(`h1`).asserts().expectThatIsNotVisible()).to.be.rejectedWith(AssertionError,
            `Selector: h1 is visible.`).and.notify(done);
    })

    test(`expect that is checked positive`, (done) => {
        expect($(`#checked`).asserts().expectThatIsChecked()).to.be.fulfilled.and.notify(done);
    })

    test(`expect that is checked negative`, (done) => {
        expect($(`#unchecked`).asserts().expectThatIsChecked()).to.be.rejectedWith(AssertionError,
            `Selector: #unchecked is not checked.`).and.notify(done);
    })

    test(`expect that is unchecked positive`, (done) => {
        expect($(`#unchecked`).asserts().expectThatIsUnchecked()).to.be.fulfilled.and.notify(done);
    })

    test(`expect that is unchecked negative`, (done) => {
        expect($(`#checked`).asserts().expectThatIsUnchecked()).to.be.rejectedWith(AssertionError,
            `Selector: #checked is checked.`).and.notify(done);
    })

    test(`expect that does not exists positive`, (done) => {
        expect($(`#not-existing`).asserts().expectThatDoesNotExists()).to.be.fulfilled.and.notify(done);
    })

    test(`expect that does not exists negative`, (done) => {
        expect($(`h1`).asserts().expectThatDoesNotExists()).to.be.rejectedWith(AssertionError,
            `Selector: h1 exists.`).and.notify(done);
    })

    test(`expect that is disabled positive`, (done) => {
        expect($(`#disabled-field`).asserts().expectThatIsDisabled()).to.be.fulfilled.and.notify(done);
    })

    test(`expect that is disabled negative`, (done) => {
        expect($(`#enabled-field`).asserts().expectThatIsDisabled()).to.be.rejectedWith(AssertionError,
            `Selector: #enabled-field is not disabled.`).and.notify(done);
    })

    test(`expect that has class positive`, (done) => {
        expect($(`#enabled-field`).asserts().expectThatHasClass('fieldsStyle')).to.be.fulfilled.and.notify(done);
    })

    test(`expect that has class negative`, (done) => {
        expect($(`#disabled-field`).asserts().expectThatHasClass('fieldsStyle')).to.be.rejectedWith(AssertionError,
            `Selector: #disabled-field does not contain class.\n            \nActual: null\n            \nExpected: fieldsStyle`)
            .and.notify(done);
    })

    test(`expect that has text positive`, (done) => {
        expect($(`h1`).asserts().expectThatHasText('Playwright')).to.be.fulfilled.and.notify(done);
    })

    test(`expect that has text negative`, (done) => {
        expect($(`h1`).asserts().expectThatHasText('Text')).to.be.rejectedWith(AssertionError,
            `Selector: h1 does not has text.\n            \nActual: Hello Playwright elements\n            \nExpected: Text`)
            .and.notify(done);
    })

    test(`expect that has inner text positive`, (done) => {
        expect($(`#inner-text`).asserts().expectThatHasInnerText('This element has inner text.')).to.be.fulfilled.and.notify(done);
    })

    test(`expect that has inner text negative`, (done) => {
        expect($(`#inner-text`).asserts().expectThatHasInnerText('Playwright')).to.be.rejectedWith(AssertionError,
            `Selector: #inner-text does not has text.\n            \nActual: This element has inner text.\n            \nExpected: Playwright`)
            .and.notify(done);
    })

    test(`expect that has value positive`, (done) => {
        const field = $(`#enabled-field`);
        field._.fill('text').then(() => {
            expect(field.asserts().expectThatHasValue('text')).to.be.fulfilled.and.notify(done);
        });
    })

    test(`expect that has value negative`, (done) => {
        const field = $(`#enabled-field`);
        field._.fill('Playwright').then(() => {
            expect(field.asserts().expectThatHasValue('text')).to.be.rejectedWith(AssertionError,
                `Selector: #enabled-field does not has text.\n            \nActual: Playwright\n            \nExpected: text`)
                .and.notify(done);
        });
    })

    test(`expect that attribute has value positive`, (done) => {
        expect($(`#enabled-field`).asserts().expectThatAttributeHasValue('type', 'text'))
            .to.be.fulfilled.and.notify(done);
    })

    test(`expect that attribute has value negative`, (done) => {
        expect($(`#enabled-field`).asserts().expectThatAttributeHasValue('type', 'test')).to.be.rejectedWith(AssertionError,
            `Selector: #enabled-field does not has attribute type with expected value.\n            \nActual: text\n            \nExpected: test`)
            .and.notify(done);
    })

    test(`expect that any has text positive`, (done) => {
        expect($(`li`).asserts().expectThatAnyHasText('text')).to.be.fulfilled.and.notify(done);
    })

    test(`expect that any has text negative`, (done) => {
        expect($(`li`).asserts().expectThatAnyHasText( 'test')).to.be.rejectedWith(AssertionError,
            `Selector: li none of elements has expected text.\n            \nActual: 1,2,3,4,5,6,text\n            \nExpected: test`)
            .and.notify(done);
    })

    test(`expect that any match text positive`, (done) => {
        expect($(`li`).asserts().expectThatAnyMatchText('text')).to.be.fulfilled.and.notify(done);
    })

    test(`expect that any match text negative`, (done) => {
        expect($(`li`).asserts().expectThatAnyMatchText( 'test')).to.be.rejectedWith(AssertionError,
            `Selector: li none of elements match expected text.\n            \nActual: 1,2,3,4,5,6,text\n            \nExpected: test`)
            .and.notify(done);
    })

    test(`expect that none of match text positive`, (done) => {
        expect($(`li`).asserts().expectThatNoneOfMatchText('Playwright')).to.be.fulfilled.and.notify(done);
    })

    test(`expect that none of match text negative`, (done) => {
        expect($(`li`).asserts().expectThatNoneOfMatchText( 'text')).to.be.rejectedWith(AssertionError,
            `Selector: li some of elements match expected text.\n            \nActual: 1,2,3,4,5,6,text\n            \nExpected: text`)
            .and.notify(done);
    })

    test(`expect that count is positive`, (done) => {
        expect($(`li`).asserts().expectThatCountIs(7)).to.be.fulfilled.and.notify(done);
    })

    test(`expect that count is negative`, (done) => {
        expect($(`li`).asserts().expectThatCountIs(6)).to.be.rejectedWith(AssertionError,
            `Selector: li does not has expected count.\n            \nActual: 7\n            \nExpected: 6`)
            .and.notify(done);
    })

    test(`expect that count is more than positive`, (done) => {
        expect($(`li`).asserts().expectThatCountIsMoreThan(6)
            .then((assert) => assert.expectThatCountIs(7))).to.be.fulfilled.and.notify(done);
    })

    test(`expect that count is more than negative`, (done) => {
        expect($(`li`).asserts().expectThatCountIsMoreThan(7)).to.be.rejectedWith(AssertionError,
            `Selector: li does not bigger than expected count.\n            \nActual: 7\n            \nExpected: 7`)
            .and.notify(done);
    })

});
