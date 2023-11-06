import { Locator, LocatorScreenshotOptions, Page } from 'playwright-core';
import { cloneDeep } from 'lodash';
import { BrowserInstance } from './browser';
import { expect } from '@playwright/test';

function extractSelector(pointer: string | WebElement): string {
    return pointer instanceof WebElement ? pointer.selector : pointer;
}

export type LocatorAssertions = ReturnType<typeof expect<Locator>>;
type InternalElements = {[key: string]: WebElement};
// Locator method options and return types
type BlurOptions = Parameters<Locator['blur']>[0];
type BoundingBoxOptions = Parameters<Locator['boundingBox']>[0];
type BoundingBoxReturnType = ReturnType<Locator['boundingBox']>;
type CheckOptions = Parameters<Locator['check']>[0];
type ClearOptions = Parameters<Locator['clear']>[0];
type ClickOptions = Parameters<Locator['click']>[0];
type DblClickOptions = Parameters<Locator['dblclick']>[0];
type DispatchEventInit = Parameters<Locator['dispatchEvent']>[1];
type DispatchEventOptions = Parameters<Locator['dispatchEvent']>[2];
type DragToOptions = Parameters<Locator['dragTo']>[1];
type FillOptions = Parameters<Locator['fill']>[1];
type FocusOptions = Parameters<Locator['focus']>[0];
type GetAttributeOptions = Parameters<Locator['getAttribute']>[1];
type HoverOptions = Parameters<Locator['hover']>[0];
type InnerHTMLOptions = Parameters<Locator['innerHTML']>[0];
type InnerTextOptions = Parameters<Locator['innerText']>[0];
type InputValueOptions = Parameters<Locator['inputValue']>[0];
type IsCheckedOptions = Parameters<Locator['isChecked']>[0];
type IsDisabledOptions = Parameters<Locator['isDisabled']>[0];
type IsEditableOptions = Parameters<Locator['isEditable']>[0];
type IsEnabledOptions = Parameters<Locator['isEnabled']>[0];
type IsVisibleOptions = Parameters<Locator['isVisible']>[0];
type PressOptions = Parameters<Locator['press']>[1];
type ScrollIntoViewIfNeededOptions = Parameters<Locator['scrollIntoViewIfNeeded']>[0];
type SelectOptionValuesType = Parameters<Locator['selectOption']>[0];
type SelectOptionOptions = Parameters<Locator['selectOption']>[1];
type SelectTextOptions = Parameters<Locator['selectText']>[0];
type SetCheckedOptions = Parameters<Locator['setChecked']>[1];
type SetInputFilesType = Parameters<Locator['setInputFiles']>[0];
type SetInputFilesOptions = Parameters<Locator['setInputFiles']>[1];
type TapOptions = Parameters<Locator['tap']>[0];
type TextContentOptions = Parameters<Locator['textContent']>[0];
type TypeOptions = Parameters<Locator['type']>[1];
type PressSequentiallyOptions = Parameters<Locator['pressSequentially']>[1];
type UncheckOptions = Parameters<Locator['uncheck']>[0];
type WaitForOptions = Parameters<Locator['waitFor']>[0];

export class WebElement {

    protected _isFrame = false;
    protected _isInFrame = false;
    protected _frameSelector = 'iframe';
    private _parents: WebElement[] = [];
    private readonly _selector: string;
    private readonly _by: By | undefined;
    private _byOptions: ByOptions | ByRoleOptions | undefined;
    private _hasLocator: string | WebElement | undefined;
    private _hasNotLocator: string | WebElement | undefined;
    private _hasText: string | RegExp | undefined;
    private _hasNotText: string | RegExp | undefined;
    private _nth: number | undefined;
    private _and: (WebElement | string) [] = [];

    constructor(selector: string, by?: By, options?: ByOptions | ByRoleOptions) {
        this._selector = selector;
        this._by = by;
        this._byOptions = options;
    }

    // page and frame pointers

    public asFrame() {
        this._isFrame = true;
        return this;
    }

    private selectLocatorMethod(element: string | WebElement | undefined): Locator | undefined {
        if (!element) return undefined;
        if (typeof element === 'string') return BrowserInstance.currentPage.locator(element);
        return this.buildLocator(BrowserInstance.currentPage, element);
    }

    private buildLocator(locatorsChain: Locator | Page, element: WebElement): Locator {
        const locatorsChainWithIframeType = element._isInFrame ? locatorsChain.frameLocator(element._frameSelector) : locatorsChain;
        switch (element._by) {
            case By.getByAltText:
                locatorsChain = locatorsChainWithIframeType[By.getByAltText](element.narrowSelector, element._byOptions);
                break;
            case By.getByLabel:
                locatorsChain = locatorsChainWithIframeType[By.getByLabel](element.narrowSelector, element._byOptions);
                break;
            case By.getByPlaceholder:
                locatorsChain = locatorsChainWithIframeType[By.getByPlaceholder](element.narrowSelector, element._byOptions);
                break;
            case By.getByRole:
                locatorsChain = locatorsChainWithIframeType[By.getByRole](element.narrowSelector as Role, element._byOptions);
                break;
            case By.getByTestId:
                locatorsChain = locatorsChainWithIframeType[By.getByTestId](element.narrowSelector);
                break;
            case By.getByText:
                locatorsChain = locatorsChainWithIframeType[By.getByText](element.narrowSelector, element._byOptions);
                break;
            case By.getByTitle:
                locatorsChain = locatorsChainWithIframeType[By.getByTitle](element.narrowSelector, element._byOptions);
                break;
            default:
                locatorsChain = locatorsChainWithIframeType.locator(element.narrowSelector, {
                    hasText: element._hasText,
                    hasNotText: element._hasNotText,
                    has: this.selectLocatorMethod(element._hasLocator),
                    hasNot: this.selectLocatorMethod(element._hasNotLocator)
                });
                break;
        }
        for (const andElement of element._and) {
            locatorsChain = locatorsChain.and(andElement instanceof WebElement ?
                andElement.locator : locatorsChainWithIframeType.locator(andElement));
        }
        if (element._nth != undefined) locatorsChain = locatorsChain.nth(element._nth);
        return locatorsChain as Locator;
    }

    private buildParentLocatorsChain(): Locator | Page {
        let locatorsChain: Locator | Page = BrowserInstance.currentPage;
        if(this.parentElements.length > 0) {
            let isInFrame = false;
            let frameSelector: string | undefined;
            for (const element of this.parentElements) {
                if (element._isFrame) {
                    isInFrame = true;
                    frameSelector = element.narrowSelector;
                    continue;
                }
                if (isInFrame) {
                    element._isInFrame = true;
                    if (frameSelector) element._frameSelector = frameSelector;
                    isInFrame = false;
                    frameSelector = undefined;
                }
                locatorsChain = this.buildLocator(locatorsChain, element);
            }
            if (isInFrame) {
                this._isInFrame = true;
                if (frameSelector) this._frameSelector = frameSelector;
            }
        }
        return locatorsChain;
    }

    public get locator(): Locator {
        return this.buildLocator(this.buildParentLocatorsChain(), this);
    }

    public get _(): Locator {
        return this.locator;
    }

    // Expect

    public expect(message?: string): LocatorAssertions {
        return expect(this.locator, message);
    }

    public softExpect(message?: string): LocatorAssertions {
        return expect.soft(this.locator, message);
    }

    // augmentation
    private recursiveParentSelectorInjection<T extends WebElement, E>(this: T, element: E) {
        const values = Object.values(element as Record<string, any>)
            .filter((value) => value instanceof WebElement);
        if (values.length) {
            values.forEach((value: WebElement) => {
                value.addParentSelector(this);
                const parents = this.parentElements;
                for(const parent of parents) {
                    value.addParentSelector(parent);
                }
                this.recursiveParentSelectorInjection(value);
            })
        }
    }

    public subElements<T extends WebElement, A extends InternalElements>(this: T, augment: A): T & A {
        const elements = augment as Record<string, WebElement>;
        Object.entries(elements).forEach(([key, value]) => {
            const clone = cloneDeep(value);
            clone.addParentSelector(this as WebElement);
            const parents = this.parentElements;
            for(const parent of parents) {
                clone.addParentSelector(parent);
            }
            this.recursiveParentSelectorInjection(clone);
            (this as any)[key] = clone;
        });
        return this as T & A;
    }

    public withMethods<T extends WebElement, A>(this: T, augment: A): T & A {
        const methods = augment as Record<string, Function>;
        Object.keys(methods).forEach(key => {
            if (key in this) throw new Error(`Can not add method with name '${key}' because such method already exists.`);
            (this as any)[key] = methods[key]
        });
        return this as T & A;
    }

    // getters setters
    get narrowSelector(): string {
        return this._selector;
    }

    private buildNarrowSelectorWithInternalLocator(target: WebElement = this): string {
        return target._hasLocator ?
            `${target.narrowSelector} >> internal:has="${typeof target._hasLocator === 'string' ? target._hasLocator : target._hasLocator.narrowSelector}"`
            : target.narrowSelector;
    }

    get selector(): string {
        if (this.parentElements.length)
            return `${this.parentsSelector} >> ${this.buildNarrowSelectorWithInternalLocator()}`;
        else
            return this.buildNarrowSelectorWithInternalLocator();
    }

    get parentsSelector(): string {
        return this.parentElements.map(element => this.buildNarrowSelectorWithInternalLocator(element)).join(' >> ');
    }

    parent<T>(this: WebElement): WebElement & T {
        return this._parents.at(-1) as WebElement & T;
    }

    private get parentElements(): WebElement[] {
        return this._parents;
    }

    private addParentSelector(parent: WebElement): void {
        this._parents.unshift(parent);
    }

    // chainable web element creation

    public clone<T extends WebElement>(this: T, options?: {
        selector?: string
        hasLocator?: string | WebElement,
        hasNotLocator?: string | WebElement,
        hasText?: string | RegExp,
        hasNotText?: string | RegExp,
        nth?: number
    }): T {
        return Object.defineProperties(cloneDeep(this), {
                _selector: {
                    value: options?.selector ?? this._selector,
                    writable: false,
                    configurable: false
                },
                _hasLocator: {
                    value: options?.hasLocator ?? this._hasLocator,
                    writable: true,
                    configurable: false
                },
                _hasNotLocator: {
                    value: options?.hasNotLocator ?? this._hasNotLocator,
                    writable: true,
                    configurable: false
                },
                _hasText: {
                    value: options?.hasText ?? this._hasText,
                    writable: true,
                    configurable: false
                },
                _hasNotText: {
                    value: options?.hasNotText ?? this._hasNotLocator,
                    writable: true,
                    configurable: false
                },
                _nth: {
                    value: options?.nth ?? this._nth,
                    writable: true,
                    configurable: false
                }
            });
    }

    public and<T extends WebElement, R extends WebElement>(this: R, element: string | T): R {
        const clone = this.clone();
        clone._and.push(element);
        return clone;
    }

    public has<T extends WebElement, R extends WebElement>(this: R, element: string | T): R {
        if(this._by) throw Error(`has option can not be used with ${this._by}, it can be used only with $ or new WebElement('#id') syntax.`)
        return this.clone({
            selector: this.narrowSelector,
            hasLocator: element,
            hasNotLocator: this._hasNotLocator,
            hasText: this._hasText,
            hasNotText: this._hasNotText,
            nth: this._nth
        });
    }

    public hasNot<T extends WebElement, R extends WebElement>(this: R, element: string | T): R {
        if(this._by) throw Error(`hasNot option can not be used with ${this._by}, it can be used only with $ or new WebElement('#id') syntax.`)
        return this.clone({
            selector: this.narrowSelector,
            hasLocator: this._hasLocator,
            hasNotLocator: element,
            hasText: this._hasText,
            hasNotText: this._hasNotText,
            nth: this._nth
        });
    }

    public hasText<R extends WebElement>(this: R, text: string | RegExp): R {
        if(this._by) throw Error(`has option can not be used with ${this._by}, it can be used only with $ or new WebElement('#id') syntax.`)
        return this.clone({
            selector: this.narrowSelector,
            hasLocator: this._hasLocator,
            hasNotLocator: this._hasNotLocator,
            hasText: text,
            hasNotText: this._hasNotText,
            nth: this._nth
        });
    }



    public hasNotText<R extends WebElement>(this: R, text: string | RegExp): R {
        if(this._by) throw Error(`hasNot option can not be used with ${this._by}, it can be used only with $ or new WebElement('#id') syntax.`)
        return this.clone({
            selector: this.narrowSelector,
            hasLocator: this._hasLocator,
            hasNotLocator: this._hasNotLocator,
            hasText: this._hasText,
            hasNotText: text,
            nth: this._nth
        });
    }

    private addParentsToWebElement(element: WebElement): WebElement {
        element.addParentSelector(this);
        for(const parent of cloneDeep(this.parentElements).reverse()) {
            element.addParentSelector(parent);
        }
        return element;
    }

    public $(selector: string): WebElement {
        return this.addParentsToWebElement(new WebElement(selector));
    }

    public $getByAltText(altText: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(altText, By.getByAltText, options));
    }

    public $getByLabel(label: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(label, By.getByLabel, options));
    }

    public $getByPlaceholder(placeholder: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(placeholder, By.getByPlaceholder, options));
    }

    public $getByRole(role: Role, options?: ByRoleOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(role, By.getByRole, options));
    }

    public $getByTestId(testId: string): WebElement {
        return this.addParentsToWebElement(new WebElement(testId, By.getByTestId));
    }

    public $getByText(text: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(text, By.getByText, options));
    }

    public $getByTitle(title: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(title, By.getByTitle, options));
    }

    public nth(index: number) {
        return this.clone({
            selector: this.narrowSelector,
            hasLocator: this._hasLocator,
            hasNotLocator: this._hasNotLocator,
            hasText: this._hasText,
            hasNotText: this._hasNotText,
            nth: index
        });
    }

    public first() {
        return this.nth(0);
    }

    public last() {
        return this.nth(-1);
    }

    // arrays of elements

    public async getAll<T extends WebElement>(this: T): Promise<T[]> {
        const elements: T[] = [];
        const amount = await this.count();
        for (let i = 0; i < amount; i++) {
            elements.push(this.nth(i));
        }
        return elements;
    }

    public async asyncForEach<T extends WebElement>(this: T, action: (element: T) => unknown | Promise<unknown>): Promise<void> {
        const list: T[] = await this.getAll();
        const promises: (unknown | Promise<unknown>)[] = []
        for (const ele of list) {
            promises.push(action(ele));
        }
        await Promise.all(promises);
    }

    public async syncForEach<T extends WebElement>(this: T, action: (element: T) => unknown | Promise<unknown>): Promise<void> {
        const list: T[] = await this.getAll();
        for (const ele of list) {
            await action(ele);
        }
    }

    public async map<T extends WebElement, R>(this: T, item: (element: T) => R | Promise<R>): Promise<Awaited<R[]>> {
        const list: T[] = await this.getAll();
        const futureItems: Promise<R>[]  = [];
        for (const ele of list) {
            futureItems.push(Promise.resolve(item(ele)));
        }
        return Promise.all(futureItems);
    }

    public filter<T extends WebElement, R extends WebElement>(this: R, options: {
        has?: string | T,
        hasNot?: string | T,
        hasText?: string | RegExp,
        hasNotText?: string | RegExp
    }): R {
        return this.clone({
            selector: this.narrowSelector,
            hasLocator: options.has ? extractSelector(options.has) : undefined,
            hasNotLocator: options.hasNot ? extractSelector(options.hasNot) : undefined,
            hasText: options.hasText,
            hasNotText: options.hasNotText,
        });
    }

    public async filterElements<T extends WebElement>(this: T, predicate: (element: T) => boolean | Promise<boolean>): Promise<T[]> {
        const list: T[] = await this.getAll();
        const matchedElements: T[] = [];
        for (const ele of list) {
            if(await predicate(ele))
                matchedElements.push(ele);
        }
        return matchedElements;
    }

    // Locator methods

    public async allInnerTexts(): Promise<Array<string>> {
        return this.locator.allInnerTexts();
    }

    public async allTextContents(): Promise<Array<string>> {
        return this.locator.allTextContents();
    }

    public async blur(options?: BlurOptions): Promise<void> {
        await this.locator.blur(options);
    }

    public async boundingBox(options?: BoundingBoxOptions): BoundingBoxReturnType {
        return this.locator.boundingBox(options);
    }

    public async check(options?: CheckOptions): Promise<void> {
        await this.locator.check(options);
    }

    public async clear(options?: ClearOptions): Promise<void> {
        await this.locator.clear(options);
    }

    public async click(options?: ClickOptions): Promise<void> {
        await this.locator.click(options);
    }

    public async count(): Promise<number> {
        return this.locator.count();
    }

    public async dblclick(options?: DblClickOptions): Promise<void> {
        await this.locator.dblclick(options);
    }

    public async dispatchEvent(type: string, eventInit?: DispatchEventInit, options?: DispatchEventOptions): Promise<void> {
        await this.locator.dispatchEvent(type, eventInit, options);
    }

    public async dragTo(target: Locator | WebElement, options?: DragToOptions): Promise<void> {
        await this.locator.dragTo(target instanceof WebElement ? target.locator : target, options);
    }

    public async fill(value: string, options?: FillOptions): Promise<void> {
        await this.locator.fill(value, options);
    }

    public async focus(options?: FocusOptions): Promise<void> {
        await this.locator.focus(options);
    }

    public async getAttribute(name: string, options?: GetAttributeOptions): Promise<string | null> {
        return this.locator.getAttribute(name, options);
    }

    public async highlight(): Promise<void> {
        await this.locator.highlight();
    }

    public async hover(options?: HoverOptions): Promise<void> {
        await this.locator.hover(options);
    }

    public async innerHTML(options?: InnerHTMLOptions): Promise<string> {
        return this.locator.innerHTML(options);
    }

    public async innerText(options?: InnerTextOptions): Promise<string> {
        return this.locator.innerText(options);
    }

    public async inputValue(options?: InputValueOptions): Promise<string> {
        return this.locator.inputValue(options);
    }

    public async isChecked(options?: IsCheckedOptions): Promise<boolean> {
        return this.locator.isChecked(options);
    }

    public async isDisabled(options?: IsDisabledOptions): Promise<boolean> {
        return this.locator.isDisabled(options);
    }

    public async isEditable(options?: IsEditableOptions): Promise<boolean> {
        return this.locator.isEditable(options);
    }

    public async isEnabled(options?: IsEnabledOptions): Promise<boolean> {
        return this.locator.isEnabled(options);
    }

    public async isHidden(): Promise<boolean> {
        return this.locator.isHidden();
    }

    public async isVisible(options?: IsVisibleOptions): Promise<boolean> {
        return this.locator.isVisible(options);
    }

    public async press(key: string, options?: PressOptions): Promise<void> {
        await this.locator.press(key, options);
    }

    public async screenshot(options?: LocatorScreenshotOptions): Promise<Buffer> {
        return this.locator.screenshot(options);
    }

    public async scrollIntoViewIfNeeded(options?: ScrollIntoViewIfNeededOptions): Promise<void> {
        await this.locator.scrollIntoViewIfNeeded(options);
    }

    public async selectOption(values: SelectOptionValuesType, options?: SelectOptionOptions): Promise<Array<string>> {
        return  this.locator.selectOption(values, options);
    }

    public async selectText(options?: SelectTextOptions): Promise<void> {
        await this.locator.selectText(options);
    }

    public async setChecked(checked: boolean, options?: SetCheckedOptions): Promise<void> {
        await this.locator.setChecked(checked, options);
    }

    public async setInputFiles(files: SetInputFilesType, options?: SetInputFilesOptions): Promise<void> {
        await this.locator.setInputFiles(files, options);
    }

    public async tap(options?: TapOptions): Promise<void> {
        await this.locator.tap(options);
    }

    public async textContent(options?: TextContentOptions): Promise<string | null> {
        return this.locator.textContent(options);
    }

    public async type(text: string, options?: TypeOptions): Promise<void> {
        await this.locator.type(text, options);
    }

    public async pressSequentially(text: string, options?: PressSequentiallyOptions): Promise<void> {
        await this.locator.pressSequentially(text, options);
    }

    public async uncheck(options?: UncheckOptions): Promise<void> {
        await this.locator.uncheck(options);
    }

    public async waitFor(options?: WaitForOptions): Promise<void> {
        await this.locator.waitFor(options);
    }
}

enum By {
    getByAltText = 'getByAltText',
    getByLabel = 'getByLabel',
    getByPlaceholder = 'getByPlaceholder',
    getByRole = 'getByRole',
    getByTestId = 'getByTestId',
    getByText = 'getByText',
    getByTitle = 'getByTitle'
}

type ByOptions = {
    exact?: boolean
}

type Role = 'alert' | 'alertdialog'| 'application' | 'article' | 'banner' | 'blockquote' | 'button' | 'caption' |
    'cell' | 'checkbox' | 'code' | 'columnheader' | 'combobox' | 'complementary' | 'contentinfo' | 'definition' |
    'deletion' | 'dialog' | 'directory' | 'document' | 'emphasis' | 'feed' | 'figure' | 'form' | 'generic' | 'grid' |
    'gridcell' | 'group' | 'heading' | 'img' | 'insertion' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' |
    'marquee' | 'math' | 'meter' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' |
    'navigation' | 'none' | 'note' | 'option' | 'paragraph' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' |
    'region' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'separator' | 'slider' |
    'spinbutton' | 'status' | 'strong' | 'subscript' | 'superscript' | 'switch' | 'tab' | 'table' | 'tablist' |
    'tabpanel'| 'term' | 'textbox' | 'time' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem';

type ByRoleOptions = {
    checked?: boolean,
    disabled?: boolean,
    exact?: boolean,
    expanded?: boolean,
    includeHidden?: boolean,
    level?: number,
    name?: string | RegExp,
    pressed?: boolean,
    selected?: boolean
}

export function $(selector: string): WebElement {
    return new WebElement(selector);
}

export function $getByAltText(altText: string, options?: ByOptions): WebElement {
    return new WebElement(altText, By.getByAltText, options);
}

export function $getByLabel(label: string, options?: ByOptions): WebElement {
    return new WebElement(label, By.getByLabel, options);
}

export function $getByPlaceholder(placeholder: string, options?: ByOptions): WebElement {
    return new WebElement(placeholder, By.getByPlaceholder, options);
}

export function $getByRole(role: Role, options?: ByRoleOptions): WebElement {
    return new WebElement(role, By.getByRole, options);
}

export function $getByTestId(testId: string): WebElement {
    return new WebElement(testId, By.getByTestId);
}

export function $getByText(text: string, options?: ByOptions): WebElement {
    return new WebElement(text, By.getByText, options);
}

export function $getByTitle(title: string, options?: ByOptions): WebElement {
    return new WebElement(title, By.getByTitle, options);
}

export function initDesktopOrMobile<T>(desktop: T, mobile: T): T {
    return BrowserInstance.isContextMobile ? mobile : desktop;
}
