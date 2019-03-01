import {useReducer, useEffect} from 'react';
import {History} from 'history';
import {stringify, parse} from 'query-string';

import reducer, {Action} from './reducer';
import {
    State,
    createString,
    createNumber,
    createArray,
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
};

type Props = {
    children: (state: State, dispatch: (action: Action) => void) => any;
    history: History;
};

export default function StateManager({children, history}: Props) {
    function lazyInit() {
        const initialState = loadState(defaultState);
        return unflattenState(initialState, parse(history.location.search));
    }
    const [state, dispatch] = useReducer(reducer, undefined, lazyInit);

    function saveState(state: State): void {
        history.push(history.location.pathname + '?' + stringify(flattenState(state)));
        try {
            localStorage.setItem('state', JSON.stringify(state));
        } catch {} // ignore write errors
    }
    function loadState(template: State): State {
        try {
            const stateJSON = localStorage.getItem('state');
            if (stateJSON !== null) {
                return JSON.parse(stateJSON);
            }
            return template;
        } catch {
            return template;
        }
    }

    useEffect(() => {
        function handleStorageChange(event) {
            dispatch({type: 'set_auto_submit', value: loadState(state).autoSubmit});
        }
        window.addEventListener('storage', handleStorageChange);
        return function cleanUp() {
            window.removeEventListener('storage', handleStorageChange);
        };
    });

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
