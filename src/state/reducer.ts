import {State, Language, SortField, Filter} from './types';

export type Action =
    | {type: 'submit_pending'}
    | {type: 'set_auto_submit'; value: boolean}
    | {type: 'set_languages'; languages: Language[]}
    | {type: 'set_search_filter'; filter: Filter}
    | {type: 'set_search_fields'; fields: string[]}
    | {type: 'set_search_sort'; sort: SortField[]};

export default function reducer(state: State, action: Action): State {
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
        case 'set_search_fields':
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {...activeSearch, fields: action.fields},
                },
            };
        case 'set_search_sort':
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {...activeSearch, sort: action.sort},
                },
            };
        case 'set_search_filter':
            return {
                ...state,
                search: {
                    ...state.search,
                    [activeSearchId]: {...activeSearch, filter: action.filter},
                },
            };
        default:
            throw new Error(`Action type is invalid.`);
    }
}
