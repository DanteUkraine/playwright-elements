// TODO: to figure out how to simulate proper use cases for stability waits.
//  Wait methods are ready to use because were developed in scope of real projects and tested on a field.
// import { $, BrowserInstance, BrowserName } from "../src";
// import { test } from "mocha";
// import chai, { expect } from "chai";
// import path from "path";
// import chaiAsPromised from 'chai-as-promised'
//
// const localFilePath = `file://${__dirname.replace(/\//g, path.sep)}/test.html`;
//
// chai.use(chaiAsPromised);
//
// describe(`Web element wait`, function () {
//
//     this.timeout(10_000);
//
//     before(async () => {
//         await BrowserInstance.start(BrowserName.CHROME);
//         await BrowserInstance.startNewPage();
//         await BrowserInstance.currentPage.setDefaultTimeout(2_500);
//         await BrowserInstance.currentPage.goto(localFilePath);
//         await BrowserInstance.currentPage.waitForSelector('h1');
//     })
//
//     after(async () => {
//         await BrowserInstance.close();
//     })
//
//     test(`withVisible should point on origin element`, async () => {
//         const element = $(`#visible-target`);
//         element.wai
//     })
//
// });
