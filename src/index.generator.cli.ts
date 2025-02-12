#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateIndexFile } from './index.generator';

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
