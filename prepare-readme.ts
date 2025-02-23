#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

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

const targetFile = process.argv[2] || 'README.md';
const targetFilePath = path.resolve(process.cwd(), targetFile);
console.log(`Processing file: ${targetFilePath}`);
updateReadmeLinks(targetFilePath);
