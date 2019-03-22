import {useReducer, useEffect, useCallback} from 'react';
import {History} from 'history';
import {stringify, parse as parseQuery} from 'query-string';

import reducer, {Action} from './reducer';
import {
    Dispatch,
    State,
    createString,
    createStringMatch,
    createNumberMatch,
    createArrayMatch,
} from './types';
import {flattenState, unflattenState} from './serialize';

const defaultSearch = {
    fields: ['veekun', 'species', 'image-fd', 'type', 'generation'],
    sort: [{id: 'order', reverse: false}],
    filter: {
        color: createString(true, 'purple'),
        generation: createString(),
        shape: createString(),
        species: createStringMatch(),
        type: createArrayMatch(true, ['poison'], 'all'),
        weight: createNumberMatch(),
    },
};
const defaultState = {
    isOffline: false,
    autoSubmit: true,
    languages: ['en'],
    search: {
        current: defaultSearch,
        pending: null,
        default: defaultSearch,
    },
    refreshCounter: 0,
    isLoading: false,
};

export default function useAppState(history: History): [State, Dispatch] {
    function saveState(state: State): void {
        history.push(history.location.pathname + '?' + stringify(flattenState(state)));
        try {
            localStorage.setItem('state', JSON.stringify(state));
        } catch {
            // ignore localStorage write errors
        }
    }
    function loadState(): State {
        let initialState = defaultState;
        try {
            const stateJSON = localStorage.getItem('state');
            if (stateJSON !== null) {
                initialState = JSON.parse(stateJSON);
            }
        } catch {
            // ignore localStorage read errors
        }

        // These should start off fresh
        initialState.isOffline = false;
        initialState.isLoading = false;
        initialState.refreshCounter = 0;

        return unflattenState(initialState, parseQuery(history.location.search));
    }

    const [state, dispatch] = useReducer(reducer, undefined, loadState);
    saveState(state);

    const dispatchCallback = useCallback(
        action => {
            console.log(action);
            dispatch(action);
            saveState(state);
        },
        [state]
    );

    return [state as State, dispatchCallback as Dispatch];
}
