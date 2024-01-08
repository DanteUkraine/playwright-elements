import {
    firefox,
    chromium,
    webkit,
    LaunchOptions,
    BrowserContext,
    Page,
    Browser,
    BrowserContextOptions
} from 'playwright-core';
import { AsyncLocalStorage } from 'async_hooks';

const customUserPage: AsyncLocalStorage<Page> = new AsyncLocalStorage();

export async function usePage<T>(page: Page, callBack: () => Promise<T>): Promise<T> {
    return customUserPage.run(page, async () => {
        return (await callBack()) as T;
    });
}

export enum BrowserName {
    CHROMIUM = 'chromium',
    CHROME = 'chrome',
    CHROME_BETA = 'chrome-beta',
    FIREFOX = 'firefox',
    WEBKIT = 'webkit',
    MSEDGE = 'msedge',
    MSEDGE_BETA = 'msedge-beta',
    MSEDGE_DEV = 'msedge-dev'
}

export class Context {

    private readonly context: BrowserContext
    private _pages: Page[];
    private _previousPage: Page | undefined;
    private _isMobile = false;

    constructor(context: BrowserContext) {
        this.context = context;
        this._pages = this.context.pages();
        this.context.on('page', page => this._pages.push(page));
    }

    get get(): BrowserContext {
        return this.context;
    }

    get pages(): Page[] {
        return this._pages;
    }

    get previousPage(): Page {
        if (this._previousPage) return this._previousPage;
        throw new Error(`Previous page was not initialized.`)
    }

    set previousPage(page: Page) {
        this._previousPage = page;
    }

    get isMobile(): boolean {
        return this._isMobile;
    }

    set isMobile(isMobile: boolean) {
        this._isMobile = isMobile;
    }

}

export class BrowserInstance {

    public static browserName: BrowserName | undefined;
    private static _browser: Browser | undefined;
    private static _currentContext: Context | undefined;
    private static _currentPage: Page | undefined;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
    }

    static get isContextMobile(): boolean {
        return this.context.isMobile;
    }

    static set isContextMobile(isMobile: boolean) {
        this.context.isMobile = isMobile;
    }

    static get currentPage(): Page {
        const customPage = customUserPage.getStore();
        if (customPage) return customPage;
        if (this._currentPage) return this._currentPage;
        throw new Error(`Page was not started`);
    }

    static set currentPage(page: Page | undefined) {
        this._currentPage = page;
    }

    static withPage(page: Page): void {
        this.currentPage = page;
        this.withContext(page.context());
    }

    private static get context(): Context {
        if (this._currentContext) return this._currentContext;
        throw new Error(`Context was not started`);
    }

    static get currentContext(): BrowserContext {
        return this.context.get;
    }

    static set currentContext(context: BrowserContext | undefined) {
        if(context) this._currentContext = new Context(context);
        else this._currentContext = context;
    }

    static withContext(context: BrowserContext): void {
        this.currentContext = context;
        this.currentContext.on('page', page => {
            if (this._currentPage) this.context.previousPage = this.currentPage;
            this.currentPage = page;
        });
        if (this._browser) return;
        const currentBrowser = context.browser();
        if (currentBrowser) this.browser = currentBrowser;
        else throw new Error(`Browser is undefined and 'context.browser()' returns null.`);
    }

    static get browser(): Browser {
        if (this._browser) return this._browser;
        throw new Error(`Browser was not started`);
    }

    static set browser(browser: Browser | undefined) {
        this._browser = browser;
    }

    static withBrowser(browser: Browser): void {
        this.browser = browser;
    }

    private static async launch(browserName?: BrowserName, options?: LaunchOptions): Promise<Browser> {
        this.browserName = browserName;
        switch (browserName) {
            case BrowserName.CHROME:
                return await chromium.launch({ ...options, ...{ channel: 'chrome' } });
            case BrowserName.MSEDGE:
                return await chromium.launch({ ...options, ...{ channel: 'msedge' } });
            case BrowserName.WEBKIT:
                return await webkit.launch({ ...options });
            case BrowserName.FIREFOX:
                return await firefox.launch({ ...options });
            default:
                return chromium.launch({ ...options });
        }
    }

    public static async start(browserName?: BrowserName, options?: LaunchOptions): Promise<Browser> {
        this.browser = await this.launch(browserName, options);
        return this.browser;
    }

    public static async startNewContext(options?: BrowserContextOptions): Promise<BrowserContext> {
        this.currentContext = await this.browser.newContext(options);
        this.currentContext.on('page', page => {
            if (this._currentPage) this.context.previousPage = this.currentPage;
            this.currentPage = page;
        });
        return this.currentContext;
    }

    public static async startNewPage(options?: BrowserContextOptions): Promise<Page> {
        if (!this._currentContext)
            await this.startNewContext(options);
        if (this._currentPage)
            this.context.previousPage = this.currentPage;
        this.currentPage = await this.currentContext.newPage();
        return this.currentPage;
    }

    public static async close(): Promise<void> {
        await this.browser.close();
        this._currentPage = undefined;
        this._currentContext = undefined;
        this._browser = undefined;
    }

    public static async switchToPreviousTab(): Promise<void> {
        this.currentPage = this.context.previousPage;
        await this.currentPage.bringToFront();
    }

    public static async switchToTabByIndex(index: number): Promise<void> {
        this.currentPage = this.context.pages[index];
        await this.currentPage.bringToFront();
    }
}
