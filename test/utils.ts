import path from 'path';

export const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;
