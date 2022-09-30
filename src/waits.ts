import {
    ASSERT_INTERVAL_TIMEOUT,
    ASSERT_TIMEOUT,
} from "./configuration";

export interface WaitOptions {
    timeoutInMilliseconds?: number;
    stabilityInMilliseconds?: number;
}

export type Result = {passed: boolean, internalErrorMessage?: string};

export async function waitFor(predicate: () => Promise<boolean>, waitOptions: WaitOptions): Promise<Result> {
    const timeout = waitOptions.timeoutInMilliseconds ? waitOptions.timeoutInMilliseconds : ASSERT_TIMEOUT;
    const interval = waitOptions.stabilityInMilliseconds ? waitOptions.stabilityInMilliseconds : ASSERT_INTERVAL_TIMEOUT;
    const cycles = timeout / interval;
    let isTimeOut = false;
    setTimeout(() => isTimeOut = true, timeout);
    for (let i = 0; i < cycles; i++) {
        const result = await new Promise<Result>(resolve => {
            setTimeout(async () => {
                try {
                    resolve({passed: await predicate()})
                } catch (error) {
                    resolve({passed: false, internalErrorMessage: (error as Error).message});
                }
            }, interval);
        });
        if (result.passed) return result;
        if (isTimeOut) return result;
    }
    return {passed: false};
}

export async function waitForStableInterval(predicate: () => Promise<boolean>, waitOptions: WaitOptions): Promise<boolean> {
    const timeout = waitOptions.timeoutInMilliseconds ? waitOptions.timeoutInMilliseconds : ASSERT_TIMEOUT;
    const interval = waitOptions.stabilityInMilliseconds ? waitOptions.stabilityInMilliseconds : ASSERT_INTERVAL_TIMEOUT;
    const cycles = timeout / interval;
    if (cycles < 2) throw new Error(`Can not check stability in such tied timeout versus interval. Timeout ${timeout}, Interval ${interval}`);
    let successfulStart = false;
    let isTimeOut = false;
    setTimeout(() => isTimeOut = true, timeout);
    for (let i = 0; i < cycles; i++) {
        const result = await new Promise<boolean>(resolve => {
            setTimeout(async () => {
                try {
                    resolve(await predicate())
                } catch (e) {
                    resolve(false);
                }
            }, interval);
        });
        if (result && !successfulStart) successfulStart = true;
        else if (result && successfulStart) return true;
        else if (!result && successfulStart) successfulStart = false;
        if (isTimeOut) return false;
    }
    return false;
}
