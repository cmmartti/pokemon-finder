import {useState, useEffect, useReducer} from 'react';
import {History} from 'history';

import {parseQueryString, updateUrl} from './urlProps';
import {Filter} from './values';

interface SortField {
    id: string;
    reverse: boolean;
}

interface Search {
    activeFilters: string[];
    sort: SortField[];
    fields: string[];
    filter: Filter;
}

export interface State {
    autoSubmit: boolean;
    isPending: boolean;
    languages: string[];
    currentSearch: Search;
    pendingSearch: Search;
}

/*
    Initialise the state object.
*/
function init(urlState): State {
    const initialSearch = {
        filter: new Filter(),
        activeFilters: ['generation', 'type'],
        sort: [{id: 'order', reverse: false}],
        fields: ['index', 'species', 'type'],
    };
    const urlSearch = urlState.currentSearch;

    // Merge the URL search with the default search object
    if (urlSearch.activeFilters.length) {
        initialSearch.activeFilters = urlSearch.activeFilters;
    }
    urlSearch.activeFilters.forEach(id => {
        initialSearch.filter[id] = urlSearch.filter[id];
    });
    if (urlSearch.fields) {
        initialSearch.fields = urlSearch.fields;
    }
    if (urlSearch.sort) {
        initialSearch.sort = urlSearch.sort;
    }

    const initialState = {
        languages: ['en'],
        autoSubmit: true,
        isPending: false,
        currentSearch: initialSearch,
        pendingSearch: initialSearch,
    };

    if (urlState.languages) {
        initialState.languages = urlState.languages;
    }

    return initialState;
}

interface Action {
    type: string;
    payload?: any;
}

/*
    Given a state object and an action, return a new state object with the changes
    described by the action.
*/
function reducer(state: State, {type, payload}: Action): State {
    const search = {...state.pendingSearch};

    let isPending = type === 'submit_pending' ? false : state.isPending;

    if (['add_filter', 'remove_filter'].includes(type)) {
        const activeFilters = new Set(state.pendingSearch.activeFilters);
        if (type === 'add_filter') activeFilters.add(payload);
        if (type === 'remove_filter') activeFilters.delete(payload);

        search.activeFilters = Array.from(activeFilters);
        if (!state.autoSubmit) isPending = true;
    } //
    else if (type === 'update_filter') {
        search.filter = search.filter.copy();
        search.filter[payload.id] = payload.value;
        if (!state.autoSubmit) isPending = true;
    } //
    else if (type === 'update_sort') {
        search.sort = payload;
        if (!state.autoSubmit) isPending = true;
    } //
    else if (type === 'update_fields') {
        search.fields = payload;
        if (!state.autoSubmit) isPending = true;
    }

    return {
        autoSubmit: type === 'set_auto_submit' ? payload : state.autoSubmit,
        isPending,
        languages: type === 'set_languages' ? payload : state.languages,
        pendingSearch: search,
        currentSearch:
            state.autoSubmit || type === 'submit_pending' ? search : state.currentSearch,
    };
}

interface Props {
    children: (state: State, dispatch: (action: Action) => void) => any;
    history: History;
}
export default function StateManager({children: render, history}: Props) {
    const urlState = parseQueryString(history);
    const [state, dispatch] = useReducer(reducer, init(urlState));
    updateUrl(state, history);

    // const forceUpdate = useReducer(x => x + 1, 0)[1];
    // useEffect(() => {
    //     function handleChange(event) {
    //         forceUpdate();
    //     }
    //     window.addEventListener('storage', handleChange);
    //     return function cleanUp() {
    //         window.removeEventListener('storage', handleChange);
    //     };
    // });

    function dispatchAndPersistState(action) {
        dispatch(action);
        updateUrl(state, history);
    }

    return render(state, dispatchAndPersistState);
}
