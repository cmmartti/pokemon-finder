import {useReducer, useEffect} from 'react';
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
    autoSubmit: true,
    languages: ['en'],
    search: {
        current: defaultSearch,
        pending: null,
        default: defaultSearch,
    },
    refreshCounter: 0,
    isLoading: false,
    printPreview: false,
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
        return unflattenState(initialState, parseQuery(history.location.search));
    }

    const [state, dispatch] = useReducer(reducer, undefined, loadState);
    saveState(state);

    return [
        state as State,
        function(action) {
            console.log(action);
            dispatch(action);
            saveState(state);
        } as Dispatch,
    ];
}
