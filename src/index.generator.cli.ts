#!/usr/bin/env node

// yargs is an optional dependency (only needed for CLI)
let yargs: typeof import('yargs') | null;
let hideBin: ((argv: string[]) => string[]) | null;
try {
    yargs = require('yargs');
    hideBin = require('yargs/helpers').hideBin;
} catch {
    yargs = null;
    hideBin = null;
}

import { generateIndexFile } from './index.generator';

if (!yargs || !hideBin) {
    console.error('[playwright-elements] CLI requires the optional dependency "yargs". Install it with: npm install yargs');
    process.exit(1);
}

const argv = yargs(hideBin(process.argv))
    .scriptName('generate-index')
    .usage('$0 <directory>', 'Generate index files in the specified directory')
    .positional('directory', {
        describe: 'Directory to generate index files in',
        type: 'string',
        demandOption: true,
    })
    .option('watch', {
        alias: 'w',
        type: 'boolean',
        description: 'Enable watch mode',
        default: false,
    })
    .option('cliLog', {
        alias: 'l',
        type: 'boolean',
        description: 'Enable logging to console',
        default: false,
    })
    .option('quotes', {
        alias: 'q',
        type: 'string',
        description: `Quote style for exports ('"' or '\\'')`,
        choices: ['"', `'`],
        default: `'`,
    })
    .help()
    .alias('help', 'h')
    .parseSync();

generateIndexFile(argv.directory as string, {
    watch: argv.watch,
    cliLog: argv.cliLog,
    quotes: argv.quotes as '"' | `'`,
});
