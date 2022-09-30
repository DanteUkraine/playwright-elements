export const PLAYWRIGHT_TIMEOUT = process.env.PWDEBUG ? 6600000 : 60000;
export const ASSERT_TIMEOUT = process.env.ASSERT_TIMEOUT ? Number(process.env.ASSERT_TIMEOUT) : 10000;
export const ASSERT_INTERVAL_TIMEOUT = process.env.STABILITY_TIMEOUT ? Number(process.env.STABILITY_TIMEOUT) : 300;
