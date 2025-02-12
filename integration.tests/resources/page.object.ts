export class HomePage {
    welcome() {
        return 'Welcome to Home!';
    }
}

export class SettingsPage {
    getSettings() {
        return { theme: 'dark' };
    }
}

export class AboutBoxElement {
    info() {
        return 'About us';
    }
}

export const version = '1.0.0';
