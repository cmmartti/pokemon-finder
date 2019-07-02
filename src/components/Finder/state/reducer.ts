import {State, SortField, Filter, Search} from './types';

export type Action =
    | {type: 'submit_pending'}
    | {type: 'clear_pending'}
    | {type: 'refresh'}
    | {type: 'set_auto_submit'; value: boolean}
    | {type: 'set_search_filter_active'; active: Array<keyof Filter>}
    | {type: 'set_search_filter'; filter: Filter}
    | {type: 'set_search_fields'; fields: string[]}
    | {type: 'set_search_sort'; sort: SortField[]};

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'submit_pending':
            if (state.pendingSearch !== null) {
                return {
                    ...state,
                    pendingSearch: null,
                    currentSearch: state.pendingSearch,
                };
            }
            return state;
        case 'refresh':
            return {...state, refreshCounter: state.refreshCounter + 1};
        case 'clear_pending':
            return {...state, pendingSearch: null};
        case 'set_auto_submit':
            return {
                ...state,
                autoSubmit: action.value,
            };
        case 'set_search_fields':
        case 'set_search_sort':
        case 'set_search_filter_active':
        case 'set_search_filter': {
            const search = state.searches[state.pendingSearch || state.currentSearch];
            const newId = state.searchCounter + 1;
            return {
                ...state,
                searchCounter: newId,
                searches: {
                    ...state.searches,
                    [newId]: searchReducer(search, action),
                },
                pendingSearch: state.autoSubmit ? null : newId,
                currentSearch: state.autoSubmit ? newId : state.currentSearch,
            };
        }
        default:
            throw new Error(`Action type is invalid.`);
    }
}

function searchReducer(state: Search, action: Action) {
    switch (action.type) {
        case 'set_search_fields':
            return {...state, fields: action.fields};
        case 'set_search_sort':
            return {...state, sort: action.sort};
        case 'set_search_filter_active':
            return {...state, active: action.active};
        case 'set_search_filter':
            return {...state, filter: action.filter};
        default:
            throw new Error(`Action type is invalid.`);
    }
}
