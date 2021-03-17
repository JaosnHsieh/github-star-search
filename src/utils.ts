import path from 'path';
import fs from 'fs';
import escaperegexp from 'lodash.escaperegexp';
import { DataFileName } from './types/DataFileNames';
import { ReadmeRepo } from './types';

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

export const getExactMatchStrs = (str = '') => [...str.matchAll(/"(.*?)"/gi)].map((s) => s[1]);

export const getNotExactMatchStr = (str = '') => str.replace(/".*?"/gi, '').trim();

export const getExactMatchRepos = (keywords: string[], repos: ReadmeRepo[]) => {
    const allRegex = keywords.map((k) => new RegExp(escaperegexp(k), 'gi'));
    return repos.filter((repo) => {
        return allRegex.every((r) => {
            const isMatchedOne = Object.entries(repo).some(([_, text]) => r.test(text));
            return isMatchedOne;
        });
    });
};
