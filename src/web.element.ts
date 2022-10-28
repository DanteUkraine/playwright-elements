import {Locator, Page} from "playwright-core";
import {expect} from "@playwright/test";
import {AssertionError} from "assert";
import {isEqual, cloneDeep} from "lodash";
import {BrowserInstance} from "./browser";

function extractSelector(pointer: string | AbstractWebElement): string {
    return pointer instanceof AbstractWebElement ? pointer.selector : pointer;
}

export interface WaitOptions {
    timeout?: number;
    interval?: number;
}

const defaultAssertWait = {
    timeout: 1_000,
    interval: 300
}

const defaultActionWait = {
    timeout: 30_000,
    interval: 500
}

type TextAssertOptions = {
    waitOptions?: WaitOptions,
    ignoreCase?: boolean,
    charsToIgnore?: RegExp
}

const defaultTextAssertOptions = {
    waitOptions: defaultAssertWait,
    ignoreCase: true,
    charsToIgnore: undefined
}

type Result = { passed: boolean, internalErrorMessage?: string };

type LocatorAssertions = ReturnType<typeof expect<Locator>>;

async function waitFor(predicate: () => Promise<boolean>, waitOptions: WaitOptions): Promise<Result> {
    const wait = {...defaultAssertWait, ...waitOptions};
    const cycles = wait.timeout / wait.interval;
    let isTimeOut = false;
    setTimeout(() => isTimeOut = true, wait.timeout);
    for (let i = 0; i < cycles; i++) {
        const result = await new Promise<Result>(resolve => {
            setTimeout(async () => {
                try {
                    resolve({passed: await predicate()})
                } catch (error) {
                    resolve({passed: false, internalErrorMessage: (error as Error).message});
                }
            }, wait.interval);
        });
        if (result.passed) return result;
        if (isTimeOut) return result;
    }
    return {passed: false};
}

async function waitForStableInterval(predicate: () => Promise<boolean>, waitOptions: WaitOptions): Promise<boolean> {
    const wait = {...defaultAssertWait, ...waitOptions};
    const cycles = wait.timeout / wait.interval;
    if (cycles < 2) throw new Error(`Can not check stability in such tied timeout versus interval. Timeout ${wait.timeout}, Interval ${wait.interval}`);
    let successfulStart = false;
    let isTimeOut = false;
    setTimeout(() => isTimeOut = true, wait.timeout);
    for (let i = 0; i < cycles; i++) {
        const result = await new Promise<boolean>(resolve => {
            setTimeout(async () => {
                try {
                    resolve(await predicate())
                } catch (e) {
                    resolve(false);
                }
            }, wait.interval);
        });
        if (result && !successfulStart) successfulStart = true;
        else if (result && successfulStart) return true;
        else if (!result && successfulStart) successfulStart = false;
        if (isTimeOut) return false;
    }
    return false;
}

export abstract class AbstractWebElement {

    protected _isFrame = false;
    protected _isInFrame = false;
    protected _frameSelector = 'iframe';
    protected _isFirst = false;
    private _parentSelector: string[] = [];
    private readonly _selector: string;
    private _hasLocator: string | undefined;

    constructor(selector: string) {
        this._selector = selector;
    }

    public usePage<T extends AbstractWebElement>(this: T, page: Page): T {
        BrowserInstance.currentPage = page;
        return this;
    }

    // page and frame pointers

    public asFrame() {
        this._isFrame = true;
        return this;
    }

    public useFirst() {
        this._isFirst = true;
        return this;
    }

    public useStrict() {
        this._isFirst = false;
        return this;
    }

    public get locator(): Locator {
        const subLocator: Locator | undefined = this._hasLocator ? BrowserInstance.currentPage.locator(this._hasLocator) : undefined;
        const locator = this._isInFrame ?
            BrowserInstance.currentPage.frameLocator(this._frameSelector).locator(this.selector, {has: subLocator}) :
            BrowserInstance.currentPage.locator(this.selector, {has: subLocator});
        if (this._isFirst) return locator.first();
        return locator;
    }

    public get _(): Locator {
        return this.locator;
    }

    public expect(message?: string): LocatorAssertions {
        return expect(this.locator, message);
    }

    public softExpect(message?: string): LocatorAssertions {
        return expect.soft(this.locator, message);
    }

    // augmentation
    private recursiveParentSelectorInjection<T extends AbstractWebElement, E>(this: T, element: E) {
        const values = Object.values(element as Record<string, any>)
            .filter((value) => value instanceof AbstractWebElement);
        if (values.length) {
            values.forEach((value) => {
                value.addParentSelector(this.selector);
                this.recursiveParentSelectorInjection(value);
            })
        }
    }

    public subElements<T extends AbstractWebElement, A>(this: T, augment: A): T & A {
        const elements = augment as Record<string, AbstractWebElement>;
        Object.entries(elements).forEach(([key, value]) => {
            let clone = cloneDeep(value);
            if (this._isFrame) {
                clone._isInFrame = true;
                clone._frameSelector = this.selector;
            } else if (this._isInFrame) {
                clone._isInFrame = true;
                clone._frameSelector = this._frameSelector;
                clone.addParentSelector(this.selector);
                this.recursiveParentSelectorInjection(clone);
            } else {
                clone.addParentSelector(this.selector);
                this.recursiveParentSelectorInjection(clone);
            }
            (this as any)[key] = clone;
        });
        return this as T & A;
    }

    public withMethods<T extends AbstractWebElement, A>(this: T, augment: A): T & A {
        const methods = augment as Record<string, Function>;
        Object.keys(methods).forEach(key => {
            if (key in this) throw new Error(`Can not add method with name '${key}' because such method already exists.`);
            Object.defineProperty(this, key, {value: methods[key]})
        });
        return this as unknown as T & A;
    }

    // getters setters
    get narrowSelector() {
        return this._selector;
    }

    get selector() {
        if (this.parentSelectors.length)
            return `${this.parentSelector} >> ${this._selector}`;
        else
            return this._selector;
    }

    get parentSelector() {
        return this.parentSelectors.join(" >> ");
    }

    private get parentSelectors() {
        return this._parentSelector;
    }

    private addParentSelector(parentSelector: string) {
        this._parentSelector.unshift(parentSelector);
    }

    private set hasLocator(selector: string) {
        this._hasLocator = selector;
    }

    // chainable web element creation

    protected $<T extends AbstractWebElement>(this: T, selector: string): T {
        return Object.create(this, {
            _selector:
                {
                    value: selector,
                    writable: false,
                    configurable: false
                }
        });
    }

    public child<T extends AbstractWebElement>(subSelector: string | T) {
        return this.$(`${this._selector} >> ${extractSelector(subSelector)}`);
    }

    public has<T extends AbstractWebElement>(selector: string | T) {
        const element = this.$(this._selector)
        element.hasLocator = extractSelector(selector);
        return element;
    }

    public withVisible() {
        return this.$(`${this._selector} >> visible=true`);
    }

    public withText(text: string) {
        return this.$(`${this._selector} >> text=${text}`);
    }

    public whereTextIs(text: string) {
        return this.$(`${this._selector} >> text="${text}"`);
    }

    public nth(index: number) {
        return this.$(`${this._selector} >> nth=${index}`);
    }

    public first() {
        return this.nth(0);
    }

    public last() {
        return this.nth(-1);
    }

    // arrays of elements

    private async getAll<T extends AbstractWebElement>(this: T) {
        const elements: T[] = [];
        const amount = await this.locator.count();
        for (let i = 0; i < amount; i++) {
            elements.push(this.nth(i));
        }
        return elements;
    }

    public async forEach<T extends AbstractWebElement>(this: T, action: (element: T) => Promise<void>): Promise<void> {
        const list: T[] = await this.getAll()
        for await (const ele of list) {
            await action(ele);
        }
    }


    public async getTextContext(options?: { timeout?: number }) {
        return this.locator.textContent(options);
    }

    public async getAttribute(attribute: string, options?: { timeout?: number }): Promise<string> {
        const attributeValue = await this.locator.getAttribute(attribute, options);
        if (!attributeValue) throw new Error(`No attribute '${attribute}' in element '${this.selector}'`);
        return attributeValue;
    }

    public async getProperty(property: string, options?: { timeout?: number }): Promise<string> {
        await this.locator.waitFor();
        const elementHandle = await this.locator.elementHandle(options);
        await elementHandle?.waitForElementState("stable");
        return String(await elementHandle?.getProperty(property));
    }

    public async count(): Promise<number> {
        return this.locator.count();
    }

    //waits

    public async waitTillStable(predicate: () => Promise<boolean>, waitOptions?: WaitOptions) {
        if (!await waitForStableInterval(predicate, {...defaultActionWait, ...waitOptions}))
            throw new Error(`Selector '${this.selector}' is not stable.`);
    }

    public async waitTillSelectorStable(waitOptions?: WaitOptions, boundingBoxTimeout = 250): Promise<void> {
        let coordinates: { [key: string]: number } | null = null;
        await this.waitTillStable(async () => {
            const actualCoordinates = await this.locator.boundingBox({timeout: boundingBoxTimeout});
            if (coordinates != null && actualCoordinates != null && isEqual(coordinates, actualCoordinates)) {
                return true;
            } else {
                coordinates = actualCoordinates;
                return false;
            }
        }, {...defaultActionWait, ...waitOptions});
    }

}

export class WebElement extends AbstractWebElement {

    // predicates with wait
    public async exists(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(async () => (await this.locator.count()) > 0, {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async notExists(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(async () => (await this.locator.count()) === 0, {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async visible(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(() => this.locator.isVisible(), {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async hidden(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(() => this.locator.isHidden(), {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async enabled(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(() => this.locator.isEnabled(), {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async disable(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(() => this.locator.isDisabled(), {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async checked(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(() => this.locator.isChecked(), {...defaultAssertWait, ...waitOptions})).passed;
    }

    public async unchecked(waitOptions?: WaitOptions): Promise<boolean> {
        return (await waitFor(async () => !await this.locator.isChecked(), {...defaultAssertWait, ...waitOptions})).passed;
    }

    public asserts(): WebElementAsserts {
        return new WebElementAsserts(this);
    }

}

class WebElementAsserts {

    private element: WebElement;

    constructor(element: WebElement) {
        this.element = element;
    }

    private get locator(): Locator {
        return this.element.locator;
    }

    // PRIVATE HELPERS

    private assertCheck(result: Result, message: string, actual?: unknown, expected?: unknown): WebElementAsserts {
        if (!result.passed) {
            throw new AssertionError({
                message: `${message}
            ${actual ? '\nActual: ' + actual : '\n' + (result.internalErrorMessage || '')}
            ${expected ? '\nExpected: ' + expected : ''}`
            });
        }
        return this;
    }

    private ignoreChars(str: string, additionalChars?: RegExp) {
        let ignoredString = str.normalize().replace(/\s|\n/g, '');
        if (additionalChars) ignoredString = ignoredString.replace(additionalChars, '');
        return ignoredString;
    }

    private includes(actual: string | null, expected: string, ignoreCase = true, charsToIgnore?: RegExp): boolean {
        if (!actual) return false;
        if (ignoreCase)
            return this.ignoreChars(actual, charsToIgnore).toLowerCase().includes(this.ignoreChars(expected, charsToIgnore).toLowerCase());
        else
            return this.ignoreChars(actual, charsToIgnore).includes(this.ignoreChars(expected, charsToIgnore));
    }

    private filter(strArr: string[], expected: string, ignoreCase = true, charsToIgnore?: RegExp) {
        if (ignoreCase) {
            return strArr.filter(item => this.ignoreChars(item, charsToIgnore).toLowerCase().match(new RegExp(this.ignoreChars(expected).toLowerCase())));
        } else {
            return strArr.filter(item => this.ignoreChars(item, charsToIgnore).match(new RegExp(this.ignoreChars(expected))));
        }
    }

    //////////////////////////////////////////////////////////

    public async expectThatIsVisible(waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        return this.assertCheck(await waitFor(() => this.locator.isVisible(), {...defaultAssertWait, ...waitOptions}), `Selector: ${this.element.selector} is not visible.`);
    }

    public async expectThatIsNotVisible(waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        return this.assertCheck(await waitFor(() => this.locator.isHidden(), {...defaultAssertWait, ...waitOptions}), `Selector: ${this.element.selector} is visible.`);
    }

    public async expectThatIsChecked(waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        return this.assertCheck(await waitFor(() => this.locator.isChecked(), {...defaultAssertWait, ...waitOptions}), `Selector: ${this.element.selector} is not checked.`);
    }

    public async expectThatIsUnchecked(waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        return this.assertCheck(await waitFor(async () => !await this.locator.isChecked(), {...defaultAssertWait, ...waitOptions}), `Selector: ${this.element.selector} is checked.`);
    }

    public async expectThatDoesNotExists(waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        return this.assertCheck(await waitFor(async () => (await this.locator.count()) === 0, {...defaultAssertWait, ...waitOptions}), `Selector: ${this.element.selector} exists.`);
    }

    public async expectThatIsDisabled(waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        return this.assertCheck(await waitFor(() => this.locator.isDisabled(), {...defaultAssertWait, ...waitOptions}), `Selector: ${this.element.selector} is not disabled.`);
    }

    public async expectThatHasClass(expectedClazz: string, waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        const wait = {...defaultAssertWait, ...waitOptions};
        let actualResult: string | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.locator.getAttribute("class", {timeout: wait.timeout});
            if (actualResult) return actualResult.split(" ").includes(expectedClazz);
            return false;
        }, wait);
        return this.assertCheck(result, `Selector: ${this.element.selector} does not contain class.`, String(actualResult), String(expectedClazz));
    }

    public async expectThatHasText(expectedText: string, assertOptions?: TextAssertOptions): Promise<WebElementAsserts> {
        const {waitOptions, ignoreCase, charsToIgnore} = {...defaultTextAssertOptions, ...assertOptions};
        let actualResult: string | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.element.getTextContext({timeout: waitOptions.timeout});
            return this.includes(actualResult, expectedText, ignoreCase, charsToIgnore);
        }, waitOptions);
        return this.assertCheck(result, `Selector: ${this.element.selector} does not has text.`, actualResult, expectedText);
    }

    public async expectThatHasInnerText(expectedText: string, assertOptions?: TextAssertOptions): Promise<WebElementAsserts> {
        const {waitOptions, ignoreCase, charsToIgnore} = {...defaultTextAssertOptions, ...assertOptions};
        let actualResult: string | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.element.getTextContext({timeout: waitOptions.timeout});
            return this.includes(actualResult, expectedText, ignoreCase, charsToIgnore);
        }, waitOptions);
        return this.assertCheck(result, `Selector: ${this.element.selector} does not has text.`, actualResult, expectedText);
    }

    public async expectThatHasValue(expectedValue: string, waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        const wait = {...defaultAssertWait, ...waitOptions}
        let actualResult: string | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.element.getProperty("value", {timeout: wait.timeout});
            if (actualResult) return actualResult === expectedValue;
            return false;
        }, wait);
        return this.assertCheck(result, `Selector: ${this.element.selector} does not has text.`, actualResult, expectedValue);
    }

    public async expectThatAttributeHasValue(attribute: string, expectedValue: string, waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        const wait = {...defaultAssertWait, ...waitOptions}
        let actualResult: string | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.element.getAttribute(attribute, {timeout: wait.timeout});
            if (actualResult) return actualResult === expectedValue;
            return false;
        }, wait);
        return this.assertCheck(result, `Selector: ${this.element.selector} does not has attribute ${attribute} with expected value.`, actualResult, expectedValue);
    }

    public async expectThatAnyHasText(expectedText: string, assertOptions?: TextAssertOptions): Promise<WebElementAsserts> {
        const {waitOptions, ignoreCase, charsToIgnore} = {...defaultTextAssertOptions, ...assertOptions};
        let actualResult: string[] | undefined;
        const result = await waitFor(async () => {
            actualResult = await this.locator.allTextContents();
            if (actualResult.length)
                return this.filter(actualResult, expectedText, ignoreCase, charsToIgnore).length > 0;
            return false;
        }, waitOptions);
        return this.assertCheck(result, `Selector: ${this.element.selector} none of elements has expected text.`, actualResult, expectedText);
    }

    public async expectThatAnyMatchText(expectedText: string, assertOptions?: TextAssertOptions): Promise<WebElementAsserts> {
        const {waitOptions, ignoreCase, charsToIgnore} = {...defaultTextAssertOptions, ...assertOptions};
        let actualResult: string[] | undefined;
        const result = await waitFor(async () => {
            actualResult = await this.locator.allTextContents();
            if (actualResult.length)
                return this.filter(actualResult, expectedText, ignoreCase, charsToIgnore).length > 0;
            return false;
        }, waitOptions);
        return this.assertCheck(result, `Selector: ${this.element.selector} none of elements match expected text.`, actualResult, expectedText);
    }

    public async expectThatNoneOfMatchText(expectedText: string, assertOptions?: TextAssertOptions): Promise<WebElementAsserts> {
        const {waitOptions, ignoreCase, charsToIgnore} = {...defaultTextAssertOptions, ...assertOptions};
        let actualResult: string[] | undefined;
        const result = await waitFor(async () => {
            actualResult = await this.locator.allTextContents();
            if (actualResult.length)
                return this.filter(actualResult, expectedText, ignoreCase, charsToIgnore).length === 0;
            return false;
        }, waitOptions);
        return this.assertCheck(result, `Selector: ${this.element.selector} some of elements match expected text.`, actualResult, expectedText);
    }

    public async expectThatCountIs(expectedCount: number, waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        let actualResult: number | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.element.count();
            if (actualResult) return actualResult === expectedCount;
            return false;
        }, {...defaultAssertWait, ...waitOptions});
        return this.assertCheck(result, `Selector: ${this.element.selector} does not has expected count.`, actualResult, expectedCount);
    }

    public async expectThatCountIsMoreThan(expectedCount: number, waitOptions?: WaitOptions): Promise<WebElementAsserts> {
        let actualResult: number | null = null;
        const result = await waitFor(async () => {
            actualResult = await this.element.count();
            if (actualResult) return actualResult > expectedCount;
            return false;
        }, {...defaultAssertWait, ...waitOptions});
        return this.assertCheck(result, `Selector: ${this.element.selector} does not bigger than expected count.`, actualResult, expectedCount);
    }
}

export function $(selector: string): WebElement {
    return new WebElement(selector);
}
