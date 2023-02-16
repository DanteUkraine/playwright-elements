import { expect } from 'chai';
import { test } from 'mocha';
import { $getByTestId, $, WebElement, BrowserInstance, BrowserName } from '../src';
import { localFilePath } from "./utils";

describe('Web Element chainable selectors', () => {

    describe('by index', function () {
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

        test('should point on first element', async () => {
            const element = $getByTestId(`test-div`)
                .subElements({
                    child: $(`div`)
                        .subElements({
                            innerChild: $(`[id]`)
                        })
                })
            expect(await element.child.first().innerChild.getAttribute('id')).is.equal(`missed`);
        });

        test('should point on last element', async () => {
            const element = $getByTestId(`test-div`)
                .subElements({
                    child: $(`div`)
                        .subElements({
                            innerChild: $(`[id]`)
                        })
                })
            expect(await element.child.last().innerChild.getAttribute('id')).is.equal(`wrong-target2`);
        });

    })

    test('should have a visible', () => {
        const element = $(`.class`)
            .subElements({
                child: $(`.child`)
                    .subElements({
                        innerChild: $(`.innerChild`)
                    })
            })
        expect(element.withVisible().child.selector).is.equal(`.class >> visible=true >> .child`);
        expect(element.child.withVisible().innerChild.selector).is.equal(`.class >> .child >> visible=true >> .innerChild`);
    });

    test('should point on element with text', () => {
        const element = $(`.class`)
            .subElements({
                child: $(`.child`)
                    .subElements({
                        innerChild: $(`.innerChild`)
                    })
            })
        expect(element.withText('text').child.selector).is.equal(`.class >> text=text >> .child`);
        expect(element.child.withText('text').innerChild.selector).is.equal(`.class >> .child >> text=text >> .innerChild`);
    });

    test('should point on element where is text', () => {
        const element = $(`.class`)
            .subElements({
                child: $(`.child`)
                    .subElements({
                        innerChild: $(`.innerChild`)
                    })
            })
        expect(element.whereTextIs('text').child.innerChild.selector).is.equal(`.class >> text="text" >> .child >> .innerChild`);
        expect(element.child.innerChild.selector).is.equal(`.class >> .child >> .innerChild`);
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
                    // stab
                }
            })).has.property('additionalMethod');
    });

    test('additional method should be added to original instance of element', () => {
        const element = $(`.selector`);
        element
            .withMethods({
                additionalMethod() {
                    // stab
                }
            })
        expect(element).has.property('additionalMethod');
    });

    test('additional methods should be tied to instance', () => {
        const commonChild = {
            child: $(`.child`)
                .withMethods({
                    additionalMethod() {
                        // stab
                    }
                })
                .subElements({
                    innerChild: $(`.innerChild`)
                        .withMethods({
                            additionalMethod() {
                                // stab
                            }
                        })
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        commonChild.child.withMethods({
            secondAdditionalMethod(){
                // stab
            }
        })
        commonChild.child.innerChild.withMethods({
            secondAdditionalMethod(){
                // stab
            }
        })
        const element2 = $(`.parent2`).subElements(commonChild);
        expect(element1.child).has.property('additionalMethod');
        expect(element1.child.innerChild).has.property('additionalMethod');
        expect(element1.child).has.not.property('secondAdditionalMethod');
        expect(element1.child.innerChild).has.not.property('secondAdditionalMethod');

        expect(element2.child).has.property('additionalMethod');
        expect(element2.child.innerChild).has.property('additionalMethod');
        expect(element2.child).has.property('secondAdditionalMethod');
        expect(element2.child.innerChild).has.property('secondAdditionalMethod');
    })

    test('should throw on duplicated additional method', () => {
        expect(() => $(`.selector`)
            .withMethods({
                withVisible() {
                    // pass
                }
            })).to.throw('Can not add method with name \'withVisible\' because such method already exists.');
    });

    test('direct child', () => {
        const element = $('parent').subElements({
            child: $('child')
            })
            .withMethods({
                subChild(this: WebElement & {child: WebElement}){
                    return this.child.$('subChild');
                }
            });
        expect(element.subChild().selector).to.equal('parent >> child >> subChild');
        expect(element.subChild().$('oneMore').selector).to.equal('parent >> child >> subChild >> oneMore');
        expect(element.subChild().selector).to.equal('parent >> child >> subChild');
    })

    test('get by method with direct child', () => {
        const element = $getByTestId('parentTestId').$('child')
            .subElements({
                subChild: $getByTestId('subChild').$('subChild2'),
            });
        expect(element.subChild.$getByPlaceholder('placeholder').selector).to.equal('parentTestId >> child >> subChild >> subChild2 >> placeholder');
    })
});
