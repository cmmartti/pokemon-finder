import {useReducer, useCallback} from 'react';
import * as queryString from 'query-string';
import {setQueryParams} from 'hookrouter';

import {reducer} from './reducer';
import {Dispatch, State} from './types';
import {flattenState, unflattenState} from './serialize';
import history from '../../../utils/history';

// prettier-ignore
const defaultState: State = {
    autoSubmit: true,
    refreshCounter: 0,
    searchCounter: 0,
    searches: {
        default: {
            fields: ['veekun', 'species', 'image-fd', 'type', 'generation'],
            sort: [{ id: 'order', reverse: false }],
            filter: {
                color:      {type: 'String',      value: 'purple'},
                generation: {type: 'String',      value: null},
                shape:      {type: 'String',      value: null},
                species:    {type: 'StringMatch', value: {string: null, match: 'has'}},
                type:       {type: 'ArrayMatch',  value: {array: ['poison'], match: 'all'}},
                weight:     {type: 'NumberMatch', value: {number: null, match: 'eq'}},
            },
            active: ['color', 'type'],
        }
    },
    currentSearch: 'default',
    pendingSearch: null,
};

function loadState(): State {
    let initialState = defaultState;

    // Load state from Local Storage if it exists
    try {
        // Replace the default search with the last-used search
        const searchJSON = localStorage.getItem('search');
        if (searchJSON !== null) {
            initialState.searches.default = JSON.parse(searchJSON);
        }

        const autoSubmit = localStorage.getItem('autoSubmit');
        if (autoSubmit !== null) {
            initialState.autoSubmit = autoSubmit === '1';
        }
    } catch {
        // ignore localStorage read errors
    }

    // Retrieve saved values from the URL query string
    const flat = queryString.parse(history.location.search) as {
        [index: string]: string | null;
    };

    return unflattenState(initialState, flat);
}

function saveState(state: State) {
    // Save to URL query string
    const flat = flattenState(state);
    setQueryParams(flat, /*replace:*/ true);
    // history.replace(history.location.pathname + '?' + queryString.stringify(flat));

    // Save to Local Storage
    try {
        const search = state.searches[state.currentSearch];
        localStorage.setItem('search', JSON.stringify(search));
        localStorage.setItem('autoSubmit', state.autoSubmit ? '1' : '0');
    } catch {
        // ignore localStorage write errors
    }
}

export function useAppState(): [State, Dispatch] {
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

    return [state, dispatchCallback as Dispatch];
}
