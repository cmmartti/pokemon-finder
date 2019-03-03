import {useReducer, useEffect} from 'react';
import {History} from 'history';
import {stringify, parse as parseQuery} from 'query-string';

import reducer, {Action} from './reducer';
import {
    State,
    createString,
    createStringMatch,
    createNumberMatch,
    createArrayMatch,
} from './types';
import {flattenState, unflattenState, decodeArray} from './serialize';

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
};

type Props = {
    children: (state: State, dispatch: (action: Action) => void) => any;
    history: History;
};

export default function StateManager({children, history}: Props) {
    function saveState(state: State): void {
        history.push(history.location.pathname + '?' + stringify(flattenState(state)));
        try {
            localStorage.setItem('state', JSON.stringify(state));
        } catch {
            // ignore write errors
        }
    }
    function loadState(): State | null {
        try {
            const stateJSON = localStorage.getItem('state');
            if (stateJSON === null) return null;
            return JSON.parse(stateJSON);
        } catch {
            return null;
        }
    }
    function lazyInit() {
        const initialState = loadState() || defaultState;
        return unflattenState(initialState, parseQuery(history.location.search));
    }

    const [state, dispatch] = useReducer(reducer, undefined, lazyInit);
    saveState(state);

    return children(state as State, function(action: Action) {
        dispatch(action);
        saveState(state);
    });
}

export type StateProps = {
    state: State;
    dispatch(action: Action): void;
};
