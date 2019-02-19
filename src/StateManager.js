import {useState, useEffect} from 'react';
import {configureUrlQuery, addUrlProps, pushUrlQuery, Serialize} from 'react-url-query';

import createHistory from 'history/createBrowserHistory';
import reducer from './reducer';

const history = createHistory();
configureUrlQuery({history});

// function saveToLocalStorage(state) {}

function useForceUpdate() {
    const [_, setCount] = useState(0);
    return () => {
        setCount(count => count + 1);
    };
}

function StateManager({children: render, urlState, updateUrl}) {
    const forceUpdate = useForceUpdate();

    // useEffect(() => {
    //     function handleChange(event) {
    //         forceUpdate();
    //     }
    //     window.addEventListener('storage', handleChange);
    //     return function cleanUp() {
    //         window.removeEventListener('storage', handleChange);
    //     };
    // });

    // Force an update if the URL changes
    useEffect(() => {
        history.listen(forceUpdate);
    }, []);

    const state = reducer();

    const [pendingSearch, setPendingSearch] = useState(state.search.pending);
    state.search.pending = pendingSearch;

    function dispatch(action) {
        const newState = reducer(state, action);
        updateUrl(newState.search.current);
        // saveToLocalStorage(newState);
        setPendingSearch(newState.search.pending);
    }

    state.search.current.activeFilters = urlState.activeFilters;
    urlState.activeFilters.forEach(id => {
        state.search.current.filters[id] = urlState.filters[id];
    });

    return render(state, dispatch);
}

// URL Query State

const {encodeArray, decodeArray} = Serialize;

function decodeSort(sortString) {
    const sort = decodeArray(sortString);
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

const filterTypes = {
    color: ['string'],
    generation: ['string'],
    shape: ['string'],
    species: ['string', 'string'],
    type: ['string', 'array'],
    weight: ['string', 'number'],
};

function encodeValue(key, value) {
    return value
        .map((v, i) =>
            Serialize.encode(filterTypes[key] ? filterTypes[key][i] : 'string', v)
        )
        .join('~');
}

function decodeValue(key, string) {
    const [_, ...values] = string.match(/^(.+)~(.+)/);
    return values.map((v, i) =>
        Serialize.decode(filterTypes[key] ? filterTypes[key][i] : 'string', v)
    );
}

function mapUrlChangeHandlersToProps() {
    function updateUrl(state) {
        const query = {
            sort: encodeSort(state.sort),
            fields: encodeArray(state.fields),
            languages: encodeArray(state.languages),
            filters: {},
        };

        // Only include active filters
        state.activeFilters.forEach(id => {
            query.filters[id] = encodeValue(id, state.filters[id].value);
        });

        pushUrlQuery(query);
    }
    return {updateUrl};
}

function mapUrlToProps({sort, fields, languages, ...urlFilters}) {
    const activeFilters = new Set();
    const filters = {};

    for (const [id, value] in Object.entries(urlFilters)) {
        activeFilters.add(id);
        filters[id] = decodeValue(id, value);
    }

    return {
        urlState: {
            sort: decodeSort(sort),
            fields: decodeArray(fields),
            languages: decodeArray(languages),
            filters,
            activeFilters: Array.from(activeFilters),
        },
    };
}

export default addUrlProps({mapUrlToProps, mapUrlChangeHandlersToProps})(StateManager);
