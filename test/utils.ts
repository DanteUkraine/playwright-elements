import { sep } from 'path';

export const localFilePath = `file://${__dirname.replace(/\//g, sep)}/test.html`;
