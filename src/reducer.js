import {combineReducers} from 'redux';

function autoSubmit(state = true, action) {
    switch (action.type) {
        case 'SET_AUTO_SUBMIT':
            return action.payload;
        default:
            return state;
    }
}

function languages(state = ['en'], action) {
    switch (action.type) {
        case 'SET_LANGUAGES':
            return action.payload;
        default:
            return state;
    }
}

//////////

// function filters(state = {}, action) {
//     switch (action.type) {
//         case 'UPDATE_FILTER':
//             return {
//                 ...state,
//                 [action.id]: action.value,
//             };
//         default:
//             return state;
//     }
// }
// function activeFilters(state = ['generation', 'types'], action) {
//     const active = new Set(state);

//     switch (action.type) {
//         case 'ADD_FILTER':
//             active.add(action.id);
//             return active;
//         case 'REMOVE_FILTER':
//             active.delete(action.id);
//             return active;
//         default:
//             return active;
//     }
// }

// function sort(state = ['order'], action) {
//     switch (action.type) {
//         case 'UPDATE_SORT':
//             return action.value;
//         default:
//             return state;
//     }
// }

// function fields(state = ['index', 'species', 'types'], action) {
//     switch (action.type) {
//         case 'UPDATE_FIELDS':
//             return action.value;
//         default:
//             return state;
//     }
// }
// const parameters = combineReducers({filters, activeFilters, sort, fields});

function search(
    state = {
        filters: {
            color: {value: null},
            generation: {value: 'generation-i'},
            shape: {value: null},
            species: {value: null, which: 'contains'},
            type: {value: ['poison'], which: 'all'},
            weight: {value: null, which: 'lt'},
        },
        activeFilters: ['generation', 'types'],
        sort: ['order'],
        fields: ['index', 'species', 'types'],
    },
    action
) {
    const active = new Set(state);
    switch (action.type) {
        case 'UPDATE_FILTER':
            return {
                ...state,
                filters: {...state.filters, [action.id]: action.value},
            };
        case 'ADD_FILTER':
            active.add(action.id);
            return {...state, activeFilters: Array.from(active)};
        case 'REMOVE_FILTER':
            active.delete(action.id);
            return {...state, activeFilters: Array.from(active)};
        case 'REMOVE_ALL_FILTERS':
            return {...state, activeFilters: []};
        case 'UPDATE_SORT':
            return {...state, sort: action.value};
        case 'UPDATE_FIELDS':
            return {...state, fields: action.value};
        default:
            return state;
    }
}

///////////

export default combineReducers({
    autoSubmit,
    languages,
    realParameters: search,
    pendingParameters: search,
});
