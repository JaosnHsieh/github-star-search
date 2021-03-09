import path from 'path';
import fs from 'fs';
import { DataFileName } from './types/DataFileNames';

export async function saveData(str: string, dataFileName: DataFileName): Promise<void> {
    return new Promise((ok, fail) => {
        fs.writeFile(path.join(__dirname, 'data', dataFileName), str, (err) => {
            if (err) {
                console.error(`$ saveData dataFileName ${dataFileName} err`, err);
                return fail(err);
            }
            return ok();
        });
    });
}

export function withRetry({
    maxCount = 20,
    timeoutMs = 5000,
}: {
    maxCount?: number;
    timeoutMs?: number;
} = {}) {
    return async (pFunc: (...args: any[]) => Promise<any>) => {
        let count = 0;
        let result: any = 'retry';

        while (count <= maxCount && result === 'retry') {
            result = await Promise.race([pFunc(), wait(timeoutMs)]);
            ++count;
        }
        if (count >= maxCount) {
            throw new Error(`Reached maxCount ${maxCount}`);
        }
        return result;
    };
}

export function wait(ms = 1000, result = 'retry') {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(result);
        }, ms);
    });
}
