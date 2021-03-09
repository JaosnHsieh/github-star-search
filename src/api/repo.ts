import X from 'x-ray';
import fetch from 'cross-fetch';
import chunk from 'lodash.chunk';
import { saveData, withRetry } from '../utils';
import { ApiResponse } from '../types/ApiResponse';
import { CrawledData, ReadmeRepo, StarRepo, Config } from '../types';
import { apiResponseValidator, readmeRepoValidator } from '../validators';

export const wrongTokenErrorMsg = '0001';

const x = X().timeout(8000).delay('3s', '8s').concurrency(3);

const crawlerDomMatcher = {
    readme: 'div.Box-body',
};

export async function getReadmeRepos(
    repos: StarRepo[],
    progressCb?: (current: number, total: number, firstRepoName: string) => void,
): Promise<ReadmeRepo[]> {
    const result: ReadmeRepo[] = [];
    const batchSize = 50;
    const chunkRepos = chunk(repos, batchSize);

    for (let i = 0; i < chunkRepos.length; ++i) {
        const batchResults: ReadmeRepo[] = await Promise.all(
            chunkRepos[i].map((repo) =>
                withRetry({ maxCount: 5, timeoutMs: 30000 })(() => getReadmeRepo(repo)),
            ),
        );
        result.push(...batchResults);
        if (progressCb) {
            progressCb(
                (i + 1) * batchSize > repos.length ? repos.length : (i + 1) * batchSize,
                repos.length,
                batchResults[0]?.name ?? '',
            );
        }
    }

    return result;
}

export async function getReadmeRepo(repo: StarRepo): Promise<ReadmeRepo> {
    let data = (await x(repo.url, crawlerDomMatcher)) as CrawledData;
    const isValid = readmeRepoValidator(data);
    if (!isValid) {
        console.error(
            'data format from crawler is wrong',
            'errors',
            readmeRepoValidator.errors,
            'data',
            JSON.stringify(data, null, 2),
        );
    }
    return {
        ...repo,
        readme: data?.readme?.replace(/\n/gi, ' ').trim() ?? '',
    };
}

export const getAllStaredRepos = async ({
    afterCursor = '',
    token = '',
    progressCb,
    max = 0,
}: {
    afterCursor?: string;
    token: string;
    progressCb?: (current: number, total: number, firstRepoName: string) => void;
    max?: number;
}) => {
    const allRepos: StarRepo[] = [];
    let endBatchCursor = '';

    const batch = async (nextCursor = '') => {
        const res = await fetch(`https://api.github.com/graphql`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            // first 100 is the github API limit of each request
            body: JSON.stringify({
                query: `
				{
					viewer {
					  starredRepositories(
						first: 100
						orderBy: { field: STARRED_AT, direction: ASC }
						${nextCursor.length > 0 ? 'after:' + '"' + nextCursor + '"' : ''}
					  ) {
						pageInfo {
						  hasNextPage
						  endCursor
						}
						totalCount
						nodes {
						  url
						  name
						  description
						  homepageUrl
						}
					  }
					}
				  }
				`,
            }),
        });

        const data = (await res.json()) as ApiResponse;
        const isValid = apiResponseValidator(data);
        if (!isValid) {
            console.error(
                'data format from github api is wrong',
                'errors',
                apiResponseValidator.errors,
                'data',
                JSON.stringify(data, null, 2),
            );
        }
        if (data?.message === 'Bad credentials') {
            throw new Error(wrongTokenErrorMsg);
        }
        const starredRepositories = data?.data?.viewer?.starredRepositories;
        const totalCount = starredRepositories?.totalCount ?? 0;
        const hasNextPage = starredRepositories?.pageInfo?.hasNextPage ?? false;
        const endCursor = starredRepositories?.pageInfo?.endCursor ?? afterCursor;
        endBatchCursor = endCursor;
        const nodes = (starredRepositories?.nodes || []) as StarRepo[];
        allRepos.push(...nodes);

        if (progressCb) {
            progressCb(allRepos.length, totalCount || 0, nodes[0]?.name);
        }
        if (hasNextPage) {
            const isStop = max !== 0 && allRepos.length >= max;
            if (isStop === false) {
                await batch(endCursor);
            }
        }
    };
    await batch(afterCursor);
    return {
        allRepos,
        endBatchCursor,
    };
};

export const saveReadmeRepos = (repos: ReadmeRepo[]): Promise<void> => {
    return saveData(JSON.stringify(repos), 'readmeRepos.json');
};

export const saveConfig = (config: Config): Promise<void> => {
    return saveData(JSON.stringify(config), 'config.json');
};
