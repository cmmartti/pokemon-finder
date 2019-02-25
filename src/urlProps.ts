import {parse, stringify} from 'query-string';
import {History} from 'history';

import {State} from './StateManager';
import {Filter} from './values';

export function updateUrl(state: State, history: History): void {
    const filters = {};

    // Only include active filter values
    state.currentSearch.activeFilters.forEach(id => {
        filters[id] = state.currentSearch.filter[id].toString();
    });

    const query = {
        sort: encodeSort(state.currentSearch.sort),
        fields: encodeArray(state.currentSearch.fields),
        lang: encodeArray(state.languages),
        ...filters,
    };

    history.push(history.location.pathname + '?' + stringify(query));
}

export function parseQueryString(history: History) {
    const {sort, fields, lang, ...urlFilters} = parse(history.location.search);
    const activeFilters = new Set();
    const filter = new Filter();

    for (const [id, value] of Object.entries(urlFilters)) {
        // Filter out unknown query parameters
        if (id in Filter) {
            activeFilters.add(id);
            filter[id].fromString(value);
        }
    }

    return {
        currentSearch: {
            activeFilters: Array.from(activeFilters),
            filter,
            fields: decodeArray(fields),
            sort: decodeSort(sort),
        },
        languages: decodeArray(lang),
    };
}

// Utils

function decodeSort(sortString: string) {
    const sort = decodeArray(sortString) || [];
    return sort.map(string => {
        if (string[0] === '-') {
            return {id: string.substring(1), reverse: true};
        }
        return {id: string, reverse: false};
    });
}

function encodeSort(sort) {
    return encodeArray(sort.map(s => (s.reverse ? `-${s.id}` : s.id)));
}

function encodeArray(array) {
    if (!array) {
        return undefined;
    }
    return array.join('_');
}

function decodeArray(arrayStr) {
    if (!arrayStr) {
        return undefined;
    }
    return arrayStr.split('_').map(item => (item === '' ? undefined : item));
}
