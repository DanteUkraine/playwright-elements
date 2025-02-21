#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

/**
 * Process the main file (e.g. README.md) and update the table of contents links.
 * It replaces local Markdown links with full GitHub Pages URLs.
 */
function updateReadmeLinks(filePath: string): void {
    let content: string;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error(`Error reading file ${filePath}: ${err}`);
        process.exit(1);
    }

    // Replace the five table-of-content links
    content = content.replace(
        /\[Get started\]\(docs\/get_started\.md\)/g,
        '[Get started](https://danteukraine.github.io/playwright-elements/docs/get_started.html)'
    );
    content = content.replace(
        /\[Web element\]\(docs\/web_element\.md\)/g,
        '[Web element](https://danteukraine.github.io/playwright-elements/docs/web_element.html)'
    );
    content = content.replace(
        /\[Playwright elements fixtures\]\(docs\/playwright_elements_fixtures\.md\)/g,
        '[Playwright elements fixtures](https://danteukraine.github.io/playwright-elements/docs/playwright_elements_fixtures.html)'
    );
    content = content.replace(
        /\[Build page object\]\(docs\/build_page_object\.md\)/g,
        '[Build page object](https://danteukraine.github.io/playwright-elements/docs/build_page_object.html)'
    );
    content = content.replace(
        /\[Browser instance\]\(docs\/browser_instance\.md\)/g,
        '[Browser instance](https://danteukraine.github.io/playwright-elements/docs/browser_instance.html)'
    );

    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated links in ${filePath}`);
    } catch (err) {
        console.error(`Error writing file ${filePath}: ${err}`);
        process.exit(1);
    }
}

/**
 * For a given file in the docs directory, replace all occurrences of "./../README.me"
 * with "https://danteukraine.github.io/playwright-elements".
 */
function updateDocsLinksInFile(filePath: string): void {
    let content: string;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error(`Error reading file ${filePath}: ${err}`);
        return;
    }

    // Replace all occurrences of "./../README.me" globally.
    const updatedContent = content.replace(/\.\/\.\.\/README\.me/g, 'https://danteukraine.github.io/playwright-elements');
    if (updatedContent !== content) {
        try {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`Updated docs link in file: ${filePath}`);
        } catch (err) {
            console.error(`Error writing file ${filePath}: ${err}`);
        }
    }
}

/**
 * Recursively process the docs directory, scanning all files and updating links.
 */
function processDocsDirectory(directory: string): void {
    let files: string[];
    try {
        files = fs.readdirSync(directory);
    } catch (err) {
        console.error(`Error reading directory ${directory}: ${err}`);
        return;
    }
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            processDocsDirectory(fullPath);
        } else if (stats.isFile()) {
            updateDocsLinksInFile(fullPath);
        }
    }
}

// Main execution

// Process the primary file (default README.md unless provided as an argument)
const targetFile = process.argv[2] || 'README.md';
const targetFilePath = path.resolve(process.cwd(), targetFile);
console.log(`Processing file: ${targetFilePath}`);
updateReadmeLinks(targetFilePath);

// Now process the docs directory
const docsDir = path.resolve(process.cwd(), 'docs');
if (fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory()) {
    console.log(`Processing docs directory: ${docsDir}`);
    processDocsDirectory(docsDir);
} else {
    console.warn(`Docs directory not found at ${docsDir}`);
}
