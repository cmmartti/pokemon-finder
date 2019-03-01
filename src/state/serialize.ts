import {
    State,
    Filter,
    Value,
    createString,
    createNumber,
    createArray,
    createStringMatch,
    createNumberMatch,
    createArrayMatch,
} from './types';

export function flattenState(state: State) {
    const search = state.search.current;
    const flat = {
        sort: encodeSort(search.sort),
        fields: encodeArray(search.fields),
        lang: encodeArray(state.languages),
    };

    // Only include active, valid filter values
    for (const [key, value] of Object.entries(search.filter)) {
        if (value.active && isValid(value)) {
            flat[key] = encode(value);
        }
    }
    return flat;
}

export function unflattenState(template: State, flat: {[key: string]: string}): State {
    const filter = {};
    for (const [key, templateValue] of Object.entries(template.search.current.filter)) {
        filter[key] =
            key in flat
                ? decode(templateValue, flat[key], key in flat)
                : {...templateValue, active: false};
    }

    return {
        ...template,
        languages: decodeArray(flat.lang) || template.languages,
        search: {
            ...template.search,
            current: {
                sort: decodeSort(flat.sort) || template.search.current.sort,
                fields: decodeArray(flat.fields) || template.search.current.fields,
                filter: filter as Filter,
            },
        },
    };
}

function isValid(v: Value) {
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

export function decode(template: Value, string: string | null, active): Value {
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

function encodeArray(array) {
    if (!array) return '';
    return array.join('_');
}

function decodeArray(arrayStr) {
    if (!arrayStr) return [];
    return arrayStr.split('_').map(item => (item === '' ? undefined : item));
}

function encodeSort(sort) {
    return encodeArray(sort.map(s => (s.reverse ? `-${s.id}` : s.id)));
}

function decodeSort(sortString: string) {
    const sort = decodeArray(sortString) || [];
    return sort.map(string => {
        if (string[0] === '-') {
            return {id: string.substring(1), reverse: true};
        }
        return {id: string, reverse: false};
    });
}
