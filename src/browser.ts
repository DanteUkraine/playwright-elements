import {
    firefox,
    chromium,
    webkit,
    LaunchOptions,
    BrowserContext,
    Page,
    Browser,
    BrowserContextOptions
} from "playwright-core";

///////////////////////////////////
export enum BrowserName {
    CHROMIUM = 'chromium',
    CHROME = 'chrome',
    FIREFOX = 'firefox',
    WEBKIT = 'webkit',
    MSEDGE = 'msedge'
}

export class Context {

    private readonly context: BrowserContext
    private _pages: Page[];
    private _previousPage: Page | undefined;

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

}

export class BrowserInstance {

    public static browserName: BrowserName | undefined;
    private static _browser: Browser | undefined;
    private static _currentContext: Context | undefined;
    private static _currentPage: Page | undefined;

    private constructor() {
    }

    // page - getter, setter, builder method

    static get currentPage(): Page {
        if (this._currentPage) return this._currentPage;
        throw new Error(`Page was not started`);
    }

    static set currentPage(page: Page | undefined) {
        this._currentPage = page;
    }

    static withPage(page: Page) {
        this.currentPage = page;
        this.withContext(page.context());
    }

    // context - getter, setter, builder method

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

    static withContext(context: BrowserContext) {
        this.currentContext = context;
        if (this._browser) return;
        const currentBrowser = context.browser();
        if (currentBrowser) this.browser = currentBrowser;
        else throw new Error(`Browser is undefined and 'context.browser()' returns null.`);
    }

    // browser - getter, setter, builder method

    static get browser(): Browser {
        if (this._browser) return this._browser;
        throw new Error(`Browser was not started`);
    }

    static set browser(browser: Browser | undefined) {
        this._browser = browser;
    }

    static withBrowser(browser: Browser) {
        this.browser = browser;
    }

    //

    private static async launch(browserName?: BrowserName, options?: LaunchOptions): Promise<Browser> {
        this.browserName = browserName;
        switch (browserName) {
            case BrowserName.CHROME:
                return await chromium.launch({...options, ...{channel: 'chrome'}});
            case BrowserName.MSEDGE:
                return await chromium.launch({...options, ...{channel: 'msedge'}});
            case BrowserName.WEBKIT:
                return await webkit.launch({...options});
            case BrowserName.FIREFOX:
                return await firefox.launch({...options});
            default:
                return chromium.launch({...options});
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

    public static async close() {
        await this.browser.close();
        this._currentPage = undefined;
        this._currentContext = undefined;
        this._browser = undefined;
    }

    // tab actions
    public static async switchToPreviousTab() {
        this.currentPage = this.context.previousPage;
        await this.currentPage.bringToFront();
    }
}
