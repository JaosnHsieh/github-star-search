import { createContext } from 'react';
import { makeAutoObservable, autorun, configure } from 'mobx';
import throttle from 'lodash.throttle';
import Fuse from 'fuse.js';
import * as api from './api/repo';
import { ReadmeRepo } from './types/Repo';
import config from './data/config.json';
import readmeRepos from './data/readmeRepos.json';
import { getExactMatchStrs, getNotExactMatchStr, getExactMatchRepos } from './utils';

type CurrentScreen = 'search' | 'token' | 'status';

/**
 * to skip the error from mobx
 * [MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: Store@1.currentScreen
 * https://stackoverflow.com/a/64771774/6414615
 * https://github.com/mobxjs/mobx/issues/2816
 * it looks like a bug in mobx since makeAutoObservable should have make setCurrentScreen an action, there is no currentScreen.
 */
configure({
    enforceActions: 'never',
});

class Store {
    fuse: Fuse<ReadmeRepo> | null = null;
    readmeRepos: ReadmeRepo[] = (readmeRepos as ReadmeRepo[]) || [];
    keyword = '';
    currentScreen: CurrentScreen = 'search';
    status = '';
    fetchStatus: 'idle' | 'pending' | 'resolved' | 'rejected' = 'idle';
    configStore: ConfigStore;
    constructor(configStore: ConfigStore) {
        this.configStore = configStore;
        this.createFuseIndex();
        makeAutoObservable(this, { configStore: false });
    }
    createFuseIndex() {
        this.fuse = new Fuse(this.readmeRepos, {
            keys: ['url', 'homepageUrl', 'name', 'description', 'readme'],
        });
    }
    setKeyword(keyword: string) {
        this.keyword = keyword;
    }

    get resultRepos(): ReadmeRepo[] {
        const trimmedKeyword = this.keyword.trim();
        if (trimmedKeyword.length === 0) {
            return this.readmeRepos;
        }
        const exactMatchStrs = getExactMatchStrs(trimmedKeyword);
        const notExactMatchStr = getNotExactMatchStr(trimmedKeyword);
        if (this.fuse && notExactMatchStr.length > 0) {
            const result = this.fuse.search(notExactMatchStr).map((i) => i.item);
            if (exactMatchStrs.length > 0) {
                return getExactMatchRepos(exactMatchStrs, result);
            }
            return result;
        } else if (exactMatchStrs.length > 0) {
            return getExactMatchRepos(exactMatchStrs, this.readmeRepos);
        }

        return [];
    }

    setStatus(status: string) {
        this.status = status;
    }

    setCurrentScreen = (screen: CurrentScreen) => {
        this.currentScreen = screen;
    };
    setReadmeRepos(repos: ReadmeRepo[]) {
        this.readmeRepos = repos;
    }
    async fetchRepos() {
        try {
            this.fetchStatus = 'pending';
            const { allRepos: staredRepos, endBatchCursor } = await api.getAllStaredRepos({
                token: this.configStore.token,
                progressCb: (current, total, firstRepoName) => {
                    store.setStatus(
                        `[${current} / ${total}] 🚚  Loading "${firstRepoName}" and more from api...`,
                    );
                },
            });
            const readmeRepos = await api.getReadmeRepos(
                staredRepos,
                (current, total, firstRepoName) => {
                    store.setStatus(
                        `[${current} / ${total}] 🚚  Crawling "${firstRepoName}" and more from webpage...`,
                    );
                },
            );
            this.configStore.setLastFetchedAt();
            this.configStore.stLastFetchedCursor(endBatchCursor);
            store.setReadmeRepos(readmeRepos);
            api.saveReadmeRepos(readmeRepos);
            this.createFuseIndex();
            store.setStatus('🚀 Ready to search');
            setTimeout(() => {
                store.setStatus('');
            }, 5000);
            this.fetchStatus = 'resolved';
        } catch (err) {
            this.fetchStatus = 'rejected';
            if (err.message === api.wrongTokenErrorMsg) {
                store.setStatus(`github token is invalid`);
                this.configStore.setToken('');
            } else {
                console.error('setReadmeRepos err', err);
            }
        }
    }
    async updateRepos() {
        try {
            const { allRepos: staredRepos, endBatchCursor } = await api.getAllStaredRepos({
                token: this.configStore.token,
                progressCb: (current, total, firstRepoName) => {
                    `[${current} / ${total}] 🚚  Updating "${firstRepoName}" and more from api...`;
                },
                afterCursor: this.configStore.lastFetchedCursor,
            });
            if (staredRepos.length > 0) {
                const readmeRepos = await api.getReadmeRepos(
                    staredRepos,
                    (current, total, firstRepoName) => {
                        store.setStatus(
                            `[${current} / ${total}] 🚚  Updating "${firstRepoName}" and more from webpage...`,
                        );
                    },
                );
                const concatedRepos = [...store.readmeRepos, ...readmeRepos];
                store.setReadmeRepos(concatedRepos);
                api.saveReadmeRepos(concatedRepos);
                this.createFuseIndex();
                setTimeout(() => {
                    store.setStatus('');
                }, 5000);
            }

            this.configStore.setLastFetchedAt();
            this.configStore.stLastFetchedCursor(endBatchCursor);
        } catch (err) {
            if (err.message === api.wrongTokenErrorMsg) {
                store.setStatus(`github token is invalid`);
                this.configStore.setToken('');
            } else {
                console.error('updateRepos err', err);
            }
        }
    }
}
class ConfigStore {
    lastFetchedCursor = '';
    lastFetchedAt = '';
    token = '';
    constructor() {
        this.lastFetchedAt = config.lastFetchedAt;
        this.lastFetchedCursor = config.lastFetchedCursor;
        this.token = config.token;
        makeAutoObservable(this);
    }
    setToken(token = '') {
        this.token = token;
    }
    setLastFetchedAt() {
        this.lastFetchedAt = new Date().toString();
    }
    stLastFetchedCursor(val = '') {
        this.lastFetchedCursor = val;
    }
}

const configStore = new ConfigStore();
const store = new Store(configStore);

const persistentConfigThrottle = throttle((configStore: ConfigStore) => {
    api.saveConfig(configStore);
});

autorun(() => {
    persistentConfigThrottle(configStore);
});

export const storeContext = createContext(store);
export const configStoreContext = createContext(configStore);
