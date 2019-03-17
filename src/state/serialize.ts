import {
    State,
    Filter,
    Value,
    SortField,
    createString,
    createNumber,
    createArray,
    createStringMatch,
    createNumberMatch,
    createArrayMatch,
} from './types';

type Flat = {[index: string]: string | null};

/*
   Turn a State object into a flat object of key/string value pairs, excluding
   non-relevant data.
*/
export function flattenState(state: State): Flat {
    const search = state.search.current;
    const flat = {
        sort: encodeSort(search.sort),
        fields: encodeArray(search.fields),
        lang: encodeArray(state.languages),
    };

    // Include only valid, active filter values
    for (const [key, value] of Object.entries(search.filter)) {
        if (isValid(value) && value.active) {
            flat[key] = encode(value);
        }
    }
    return flat;
}

/*
   Turn a `flat` object of key/string value pairs into a complete State object by
   comparing them by key with the supplied `mergeWith` State object, filling in any
   missing filter values from `mergeWith` (but marked inactive). Filter keys in `flat`
   that don't exist in `mergeWith` will be ignored.
*/
export function unflattenState(mergeWith: State, flat: Flat): State {
    const defaultSearch = mergeWith.search.default;

    const sort = decodeSort(flat.sort);
    const fields = decodeArray(flat.fields);
    const filter = {};
    let customFilterExists = false;
    for (const [key, defaultValue] of Object.entries(defaultSearch.filter)) {
        if (key in flat) {
            customFilterExists = true;
        }
        filter[key] =
            key in flat
                ? decode(defaultValue, flat[key], key in flat)
                : {...defaultValue, active: false};
    }
    const languages = decodeArray(flat.lang);

    return {
        ...mergeWith,
        languages: languages.length ? languages : mergeWith.languages,
        search: {
            ...mergeWith.search,
            current: {
                sort: sort.length ? sort : defaultSearch.sort,
                fields: fields.length ? fields : defaultSearch.fields,
                filter: customFilterExists ? (filter as Filter) : defaultSearch.filter,
            },
        },
    };
}

/*
   Validate whether the value of a Value matches its type.
 */
function isValid(v: Value): boolean {
    switch (v.type) {
        case 'string':
        case 'number':
            return v.value === null || typeof v.value === v.type;
        case 'array':
            return Array.isArray(v.value);
        case 'StringMatch':
            return (
                'string' in v.value &&
                (typeof v.value.string === 'string' || v.value.string === null) &&
                'match' in v.value &&
                ['has', 'sw', 'eq'].includes(v.value.match)
            );
        case 'NumberMatch':
            return (
                'number' in v.value &&
                (typeof v.value.number === 'number' || v.value.number === null) &&
                'match' in v.value &&
                ['gt', 'lt', 'eq'].includes(v.value.match)
            );
        case 'ArrayMatch':
            return (
                'array' in v.value &&
                Array.isArray(v.value.array) &&
                'match' in v.value &&
                ['all', 'some', 'eq'].includes(v.value.match)
            );
        default:
            return false;
    }
}

function encode(value: Value): string | null {
    switch (value.type) {
        case 'StringMatch':
            return `${value.value.match}~${value.value.string}`;
        case 'NumberMatch':
            return `${value.value.match}~${
                value.value.number !== null ? value.value.number : ''
            }`;
        case 'ArrayMatch':
            return `${value.value.match}~${encodeArray(value.value.array)}`;
        case 'array':
            return encodeArray(value.value);
        case 'string':
        case 'number':
        default:
            return value.value === null ? null : value.value.toString();
    }
}

function decode(template: Value, string: string | null, active): Value {
    const {type} = template;
    switch (type) {
        case 'StringMatch':
            if (string !== null) {
                const match = string.match(/^(has|sw|eq)~(.*)$/);
                if (match)
                    return createStringMatch(active, match[2], match[1] as
                        | 'has'
                        | 'sw'
                        | 'eq');
            }
            return createStringMatch(active);
        case 'NumberMatch':
            if (string !== null) {
                const match = string.match(/^(lt|gt|eq)~(\d*)$/);
                if (match) {
                    const number = parseFloat(match[2]);
                    return createNumberMatch(
                        active,
                        isNaN(number) ? null : number,
                        match[1] as 'lt' | 'gt' | 'eq'
                    );
                }
            }
            return createNumberMatch(active);
        case 'ArrayMatch':
            if (string !== null) {
                const match = string.match(/^(all|some|eq)~(.*)$/);
                if (match)
                    return createArrayMatch(active, decodeArray(match[2]), match[1] as
                        | 'all'
                        | 'some'
                        | 'eq');
            }
            return createArrayMatch(active);
        case 'array':
            return createArray(active, decodeArray(string));
        case 'number': {
            if (string === null || string === '') {
                return createNumber(active, null);
            }
            const number = parseFloat(string);
            return createNumber(active, isNaN(number) ? null : number);
        }
        default:
        case 'string':
            if (string === null || string === '') {
                return createString(active, null);
            }
            return createString(active, string);
    }
}

function encodeArray(array: string[]): string {
    if (!array) return '';
    return array.join('_');
}

function decodeArray(arrayStr: string | null): string[] {
    if (!arrayStr) return [];
    return arrayStr.split('_').map(item => item);
}

function encodeSort(sort: SortField[]): string {
    return encodeArray(sort.map(s => (s.reverse ? `-${s.id}` : s.id)));
}

function decodeSort(sortString: string | null): SortField[] {
    const sort = decodeArray(sortString);
    return sort.map(string => {
        if (string[0] === '-') {
            return {id: string.substring(1), reverse: true};
        }
        return {id: string, reverse: false};
    });
}
