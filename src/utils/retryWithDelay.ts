/** Wait or sleep a number of milliseconds */
const wait = (msecDuration: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, msecDuration));
};

/** Retry an asynchronous function a number of times, waiting in between */
export const retry = async <T>(
    workerFn: { (): Promise<T>; },
    retries = 3,
    delay = 500
): Promise<T> => {
    try {
        return await workerFn();
    } catch (e) {
        if (retries > 1) {
            await wait(delay);
            return await retry(workerFn, retries - 1, delay * 2);
        } else {
            throw e;
        }
    }
};