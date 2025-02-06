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

export class AboutBoxElement { // Will be ignored unless custom suffix is provided.
    info() {
        return 'About us';
    }
}

export const version = '1.0.0'; // Not a class, so it's ignored.