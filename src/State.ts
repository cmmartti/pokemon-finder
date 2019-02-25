import {useReducer} from 'react';
import {History} from 'history';

type State = {
    readonly autoSubmit: boolean;
    readonly languages: string[];
    readonly search: {
        current: Search;
        pending: Search | null;
        default: Search;
    };
};

type Search = {
    readonly fields: string[];
    readonly sort: {id: string; reverse: boolean}[];
    readonly filter: Filter;
    readonly filterValues: FilterValues;
};

type Filter = {
    readonly color: boolean;
    readonly generation: boolean;
    readonly type: boolean;
    readonly species: boolean;
    readonly weight: boolean;
};

type FilterValues = {
    readonly color: string | null;
    readonly generation: string | null;
    readonly type: ListMatchValue | null;
    readonly species: StringMatchValue | null;
    readonly weight: NumberMatchValue | null;
};

type ListMatch = 'all' | 'some' | 'eq';
export class ListMatchValue {
    constructor(public list: string[], public match: ListMatch = 'all') {}
    toString() {
        const encodeArray = array => (!array ? '' : array.join('_'));
        return `${this.match}~${encodeArray(this.list)}`;
    }
}

type StringMatch = 'has' | 'sw' | 'eq';
export class StringMatchValue {
    constructor(public string: string, public match: StringMatch = 'has') {}
    toString() {
        return `${this.match}~${this.string}`;
    }
}

type NumberMatch = 'lt' | 'gt' | 'eq';
export class NumberMatchValue {
    constructor(public number: number | null, public match: NumberMatch = 'gt') {}
    toString() {
        return `${this.match}~${this.number}`;
    }
}

type Action =
    | {type: 'submit_pending'}
    | {type: 'set_auto_submit'; value: boolean}
    | {type: 'set_languages'; languages: string[]}
    | {type: 'set_search_filter_values'; filterValues: FilterValues}
    | {type: 'set_search_filter'; filter: Filter}
    | {type: 'set_search_fields'; fields: string[]}
    | {type: 'set_search_sort'; sort: SortField[]};

type SortField = {id: string; reverse: boolean};

function reducer(state: State, action: Action) {
    const activeSearchId = state.autoSubmit ? 'current' : 'pending';
    const activeSearch = state.search[activeSearchId] || state.search.current;

    switch (action.type) {
        case 'submit_pending':
            return {
                ...state,
                search: {
                    ...state.search,
                    pending: null,
                    current: state.search.pending || state.search.current,
                },
            };
        case 'set_auto_submit':
            return {...state, autoSubmit: action.value};
        case 'set_languages':
            return {...state, languages: action.languages};
        case 'set_search_fields': {
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {...activeSearch, fields: action.fields},
                },
            };
        }
        case 'set_search_sort': {
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {...activeSearch, sort: action.sort},
                },
            };
        }
        case 'set_search_filter': {
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {...activeSearch, filter: action.filter},
                },
            };
        }
        case 'set_search_filter_values': {
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {
                        ...activeSearch,
                        filterValues: action.filterValues,
                    },
                },
            };
        }
        default:
            return state;
    }
}

const defaultSearch = {
    fields: ['veekun', 'species', 'image-fd', 'type', 'generation'],
    sort: [{id: 'order', reverse: false}],
    filter: {
        color: true,
        generation: false,
        shape: false,
        species: false,
        type: true,
        weight: false,
    },
    filterValues: {
        color: 'purple',
        generation: null,
        shape: null,
        species: null,
        type: new ListMatchValue(['poison'], 'all'),
        weight: null,
    },
};
const initialState = {
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
    function reducer2(state, action) {
        const newState = reducer(state, action);
        console.log(newState);
        return newState;
    }
    const [state, dispatch] = useReducer(reducer2, initialState);

    function dispatchAndLog(action: Action) {
        console.log(action);
        dispatch(action);
    }
    return children(state as State, dispatchAndLog);
}
