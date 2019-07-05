import {State, Filter, Value, SortField} from './types';

type Flat = {[index: string]: string | null};

/**
 * Turn a `state` object into a flat object of key-value pairs suitable for persisting
 * in a URL as query parameters. Values that aren't relevant to a URL will be omitted.
 */
export function flattenState(state: State): Flat {
    const curSearch = state.searches[state.currentSearch];
    const flat: Flat = {};

    // Include only valid, active filter values
    for (const [key, value] of Object.entries(curSearch.filter)) {
        if (isValid(value) && curSearch.active.includes(key as keyof Filter)) {
            flat[key] = encode(value);
        }
    }

    flat.sort = encodeSort(curSearch.sort);
    flat.fields = encodeArray(curSearch.fields);
    return flat;
}

/**
 * Convert a `flat` object of key-value pairs into a new State object, using `mergeWith`
 * for any missing values. Unknown keys in `flat` will be ignored.
 */
export function unflattenState(mergeWith: State, flat: Flat): State {
    const curSearch = mergeWith.searches[mergeWith.currentSearch];

    const sort = decodeSort(flat.sort);
    const fields = decodeArray(flat.fields);

    const filter = {};
    const active: Array<keyof Filter> = [];

    // Use the current filter as a template
    for (const [key, curValue] of Object.entries(curSearch.filter)) {
        if (key in flat) {
            active.push(key as keyof Filter);
            filter[key] = decode(flat[key], curValue.type);
        } else {
            filter[key] = curValue;
        }
    }

    const newSearchId = mergeWith.searchCounter + 1;
    return {
        ...mergeWith,
        searches: {
            ...mergeWith.searches,
            [newSearchId]: {
                sort: sort.length > 0 ? sort : curSearch.sort,
                fields: fields.length > 0 ? fields : curSearch.fields,
                filter: active.length > 0 ? (filter as Filter) : curSearch.filter,
                active: active.length > 0 ? active : curSearch.active,
            },
        },
        currentSearch: newSearchId,
        searchCounter: newSearchId,
    };
}

/**
 * Validate whether the value of a Value matches its type.
 */
function isValid(v: Value): boolean {
    switch (v.type) {
        case 'String':
            return v.value === null || typeof v.value === 'string';
        case 'Number':
            return v.value === null || typeof v.value === 'number';
        case 'Array':
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

/**
 * Encode `value` into a URL-safe and human-readable string.
 * Empty values will be returned as `null`.
 */
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
        case 'Array':
            return encodeArray(value.value);
        case 'String':
        case 'Number':
        default:
            return value.value === null ? null : value.value.toString();
    }
}

/**
 * Given a `string` and a `type`, return the decoded Value.
 */
function decode(string: string | null, type: Value['type']): Value {
    switch (type) {
        case 'StringMatch':
            if (string !== null) {
                const match = string.match(/^(has|sw|eq)~(.*)$/);
                if (match)
                    return {
                        type: 'StringMatch' as 'StringMatch,
                        value: {
                            string: match[2],
                            match: match[1] as 'has' | 'sw' | 'eq',
                        },
                    };
            }
            return {
                type: 'StringMatch' as 'StringMatch,
                value: {
                    string: null,
                    match: 'has',
                },
            };
        case 'NumberMatch':
            if (string !== null) {
                const match = string.match(/^(lt|gt|eq)~(\d*)$/);
                if (match) {
                    const number = parseFloat(match[2]);
                    return {
                        type: 'NumberMatch' as 'NumberMatch',
                        value: {
                            number: isNaN(number) ? null : number,
                            match: match[1] as 'lt' | 'gt' | 'eq',
                        },
                    };
                }
            }
            return {type: 'NumberMatch' as 'NumberMatch', value: {number: null, match: 'eq'}};
        case 'ArrayMatch':
            if (string !== null) {
                const match = string.match(/^(all|some|eq)~(.*)$/);
                if (match)
                    return {
                        type: 'ArrayMatch' as 'ArrayMatch',
                        value: {
                            array: decodeArray(match[2]),
                            match: match[1] as 'all' | 'some' | 'eq',
                        },
                    };
            }
            return {
                type: 'ArrayMatch' as 'ArrayMatch',
                value: {
                    array: [],
                    match: 'all',
                },
            };
        case 'Array':
            return {
                type: 'Array' as 'Array',
                value: decodeArray(string),
            };
        case 'Number': {
            if (string === null || string === '') {
                return {
                    type: 'Number' as 'Number',
                    value: null,
                };
            }
            const number = parseFloat(string);
            return {
                type: 'Number' as 'Number',
                value: isNaN(number) ? null : number,
            };
        }
        default:
        case 'String':
            if (string === null || string === '') {
                return {type: 'String' as 'String', value: null};
            }
            return {
                type: 'String' as 'String',
                value: string,
            };
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
