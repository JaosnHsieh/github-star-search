import React, { useCallback, useContext, useEffect, useState } from 'react';
import { storeContext, configStoreContext } from './store';
import { Text, Box, useInput } from 'ink';
import { observer } from 'mobx-react-lite';
import TextInput from 'ink-text-input';
import debounce from 'lodash.debounce';
import open from 'open';

const MobxTokenPage = observer(TokenPage);
const MobxSearchPage = observer(SearchPage);
const MobxApp = observer(App);

function App() {
    const store = useContext(storeContext);
    useSideEffect();

    const status = store.status.length > 0 && (
        <Box marginY={1}>
            <Text color="gray">{store.status}</Text>
        </Box>
    );
    return (
        <Box flexDirection="column">
            <Text color="cyan">github-star-search</Text>
            {store.currentScreen === 'token' && <MobxTokenPage />}
            {store.currentScreen === 'search' && <MobxSearchPage />}
            {status}
        </Box>
    );
}

function SearchPage() {
    const pageSize = 5;
    const [selectionIndex, setSelectionIndex] = useState(-1);
    const store = useContext(storeContext);
    const { start, end, goPrev, goNext, hasNext, hasPrev } = usePagination(
        store.keyword,
        store.resultRepos.length,
        0,
        pageSize,
    );
    const [inputText, setInputText] = useState(store.keyword);
    const debouncedSetKeywords = useCallback(
        debounce((keyword: string) => {
            store.setKeyword(keyword);
        }, 200),
        [],
    );
    useInput((_, key) => {
        if (!key) return;
        if (key.pageDown) {
            goNext();
        }
        if (key.pageUp) {
            goPrev();
        }
        if (key.downArrow) {
            if (selectionIndex < pageSize - 1) {
                setSelectionIndex(selectionIndex + 1);
            }
            if (selectionIndex === pageSize - 1 && hasNext) {
                goNext();
            }
        }
        if (key.upArrow) {
            if (selectionIndex > 0) {
                setSelectionIndex(selectionIndex - 1);
            }
            if (selectionIndex === 0 && hasPrev) {
                goPrev();
            }
        }
        if (key.return) {
            const selectedRepo = store.resultRepos?.[start + selectionIndex];
            if (selectionIndex >= 0 && selectedRepo !== undefined) {
                open(selectedRepo.url);
            }
        }
    });

    const pagedown = '[6~';
    const pageUp = '[5~';
    const pagedRepos = store.resultRepos.slice(start, end);
    if (store.fetchStatus === 'pending') {
        return null;
    }
    const searchBox = (
        <Box flexDirection="row">
            <Text color="blue">Keywords: </Text>
            <TextInput
                focus={store.readmeRepos.length > 0}
                value={inputText}
                onChange={(val) => {
                    if (val.includes(pagedown) || val.includes(pageUp)) {
                        return;
                    }
                    setSelectionIndex(-1);
                    setInputText(val);
                    debouncedSetKeywords(val);
                }}
            ></TextInput>
            <Box marginX={3}>
                <Text color="grey">
                    {store.readmeRepos.length === 0 &&
                        "No Stared Repos Found. Type 'R' to Refetch. Type 'T' to reset Token."}
                    {store.readmeRepos.length > 0 &&
                        store.resultRepos.length === 0 &&
                        `"${store.keyword}" found no results. try other keywords.`}
                    {store.resultRepos.length > 0 && `(${start + 1}/${store.resultRepos.length})`}
                </Text>
            </Box>
        </Box>
    );

    const resultBoxList = pagedRepos.map((r, i) => {
        const isSelected = i === selectionIndex;
        return (
            <Box flexDirection="row" height={3} key={r.url}>
                <Box width={4} marginRight={1}>
                    <Text
                        color={isSelected ? 'white' : 'green'}
                        backgroundColor={isSelected ? 'green' : undefined}
                    >
                        {isSelected ? '>>' : `${start + i + 1}.`}
                    </Text>
                </Box>
                <Box flexDirection="column">
                    <Text color="green">{r.name}</Text>
                    <Text>{r.url}</Text>
                    <Text>
                        {r?.description?.length > 100
                            ? `${r.description.slice(0, 100)}.....`
                            : r.description}
                    </Text>
                </Box>
            </Box>
        );
    });
    return (
        <Box flexDirection="column">
            {searchBox}
            {resultBoxList}
        </Box>
    );
}

function TokenPage() {
    const configStore = useContext(configStoreContext);
    const store = useContext(storeContext);
    const [tokenText, setTokenText] = useState(configStore.token);

    return (
        <>
            <Box marginY={1}>
                <Text color="blue" bold>
                    Token:{' '}
                </Text>
                <TextInput
                    onSubmit={(val) => {
                        configStore.setToken(val);
                        store.setCurrentScreen('search');
                    }}
                    value={tokenText}
                    onChange={setTokenText}
                />
            </Box>
            <Box marginY={3}>
                <Text color="grey">{`Get your github personal access toek on https://github.com/settings/tokens\nWith permission "public_repo" -> "Access public repositories" only.`}</Text>
            </Box>
        </>
    );
}

function useSideEffect() {
    const store = useContext(storeContext);
    const configStore = useContext(configStoreContext);

    if (configStore?.token?.length <= 0 && store.currentScreen !== 'token') {
        store.setCurrentScreen('token');
    }

    useInput((input) => {
        if (store?.readmeRepos?.length === 0 && configStore?.token?.length > 0) {
            if (input === 'R') {
                store.fetchRepos();
            }
            if (input === 'T') {
                store.setCurrentScreen('token');
            }
        }
    });

    useEffect(() => {
        if (configStore.token.length <= 0) {
            return;
        }
        const isFirstFetch = configStore.lastFetchedCursor?.length === 0;
        const isOver1Day =
            new Date().getTime() - new Date(configStore.lastFetchedAt).getTime() >
            1000 * 60 * 60 * 24;

        if (isFirstFetch) {
            store.fetchRepos();
            return;
        }

        if (isOver1Day) {
            store.updateRepos();
            return;
        }
    }, [configStore.token]);
}

function usePagination(keyword = '', max = 0, init = 0, pageSize = 5) {
    const [start, setStart] = useState(init);
    const [end, setEnd] = useState(init + pageSize > max ? max : init + pageSize);
    const hasNext = start + pageSize <= max;
    const hasPrev = start - pageSize >= 0;
    useEffect(() => {
        setStart(0);
        setEnd(init + pageSize > max ? max : init + pageSize);
    }, [keyword]);

    return {
        goPrev: () => {
            if (hasPrev) {
                setStart(start - pageSize);
                setEnd(end - pageSize);
            }
        },
        goNext: () => {
            if (hasNext) {
                setStart(start + pageSize);
                setEnd(end + pageSize);
            }
        },
        start,
        end,
        hasNext,
        hasPrev,
    };
}
export default MobxApp;
