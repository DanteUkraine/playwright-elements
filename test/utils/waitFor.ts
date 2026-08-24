import fs from 'fs';

/**
 * Options for waitForFile polling
 */
export interface WaitForFileOptions {
    timeout?: number;      // Maximum time to wait in ms (default: 5000)
    interval?: number;     // Polling interval in ms (default: 100)
}

/**
 * Wait for a file to exist on the filesystem
 * @param filePath - Path to the file to wait for
 * @param options - Polling options
 * @returns Promise that resolves when file exists
 */
export async function waitForFileToExist(
    filePath: string,
    options: WaitForFileOptions = {}
): Promise<void> {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (fs.existsSync(filePath)) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(
        `File "${filePath}" did not appear within ${timeout}ms`
    );
}

/**
 * Wait for a file to contain specific content
 * @param filePath - Path to the file to check
 * @param expectedContent - String or regex to search for in file content
 * @param options - Polling options
 * @returns Promise that resolves when content is found
 */
export async function waitForFileContent(
    filePath: string,
    expectedContent: string | RegExp,
    options: WaitForFileOptions = {}
): Promise<string> {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();
    const isRegex = expectedContent instanceof RegExp;

    let lastContent = '';

    while (Date.now() - startTime < timeout) {
        try {
            if (!fs.existsSync(filePath)) {
                await new Promise((resolve) => setTimeout(resolve, interval));
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            lastContent = content;

            if (isRegex) {
                if ((expectedContent as RegExp).test(content)) {
                    return content;
                }
            } else if (content.includes(expectedContent as string)) {
                return content;
            }
        } catch {
            // File might be temporarily locked, continue polling
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(
        `File "${filePath}" did not contain expected content within ${timeout}ms. ` +
        `Last content: ${lastContent.slice(0, 200)}${lastContent.length > 200 ? '...' : ''}`
    );
}

/**
 * Wait for a file to be updated (content changes from previous state)
 * @param filePath - Path to the file to watch
 * @param options - Polling options
 * @returns Promise that resolves when file content changes
 */
export async function waitForFileUpdate(
    filePath: string,
    options: WaitForFileOptions = {}
): Promise<string> {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();

    let previousContent = '';

    // Read initial content
    if (fs.existsSync(filePath)) {
        previousContent = fs.readFileSync(filePath, 'utf-8');
    }

    while (Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, interval));

        try {
            if (fs.existsSync(filePath)) {
                const currentContent = fs.readFileSync(filePath, 'utf-8');
                if (currentContent !== previousContent) {
                    return currentContent;
                }
            }
        } catch {
            // File might be temporarily locked, continue polling
        }
    }

    throw new Error(
        `File "${filePath}" was not updated within ${timeout}ms`
    );
}
