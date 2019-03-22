import {Action} from './reducer';

export type Dispatch = (action: Action) => void;

// State tree
export type State = {
    readonly isOffline: boolean;
    readonly autoSubmit: boolean;
    readonly languages: Language[];
    readonly search: {
        current: Search;
        pending: Search | null;
        default: Search;
    };
    readonly refreshCounter: number;
    readonly isLoading: boolean;
};
export type Language = string;
export type Search = {
    readonly fields: string[];
    readonly sort: SortField[];
    readonly filter: Filter;
};
export type Filter = {
    readonly color: StringValue;
    readonly generation: StringValue;
    readonly shape: StringValue;
    readonly species: StringMatchValue;
    readonly type: ArrayMatchValue;
    readonly weight: NumberMatchValue;
};
export type SortField = {id: string; reverse: boolean};

// Value types
type StringValue = {type: 'string'; value: string | null; active: boolean};
type NumberValue = {type: 'number'; value: number | null; active: boolean};
type ArrayValue = {type: 'array'; value: string[]; active: boolean};
type StringMatchValue = {
    type: 'StringMatch';
    value: {string: string | null; match: 'has' | 'sw' | 'eq'};
    active: boolean;
};
type NumberMatchValue = {
    type: 'NumberMatch';
    value: {number: number | null; match: 'gt' | 'lt' | 'eq'};
    active: boolean;
};
type ArrayMatchValue = {
    type: 'ArrayMatch';
    value: {array: string[]; match: 'all' | 'some' | 'eq'};
    active: boolean;
};
export type Value =
    | StringValue
    | NumberValue
    | ArrayValue
    | StringMatchValue
    | NumberMatchValue
    | ArrayMatchValue;

// Create value functions
export function createString(
    active: boolean = false,
    string: string | null = null
): StringValue {
    return {type: 'string', value: string, active};
}
export function createNumber(
    active: boolean = false,
    number: number | null = null
): NumberValue {
    return {type: 'number', value: number, active};
}
export function createArray(active: boolean = false, array: string[] = []): ArrayValue {
    return {type: 'array', value: array, active};
}
export function createStringMatch(
    active: boolean = false,
    string: string | null = null,
    match: 'has' | 'sw' | 'eq' = 'has'
): StringMatchValue {
    return {type: 'StringMatch', active, value: {string, match}};
}
export function createNumberMatch(
    active: boolean = false,
    number: number | null = null,
    match: 'gt' | 'lt' | 'eq' = 'gt'
): NumberMatchValue {
    return {type: 'NumberMatch', active, value: {number, match}};
}
export function createArrayMatch(
    active: boolean = false,
    array: string[] = [],
    match: 'all' | 'some' | 'eq' = 'all'
): ArrayMatchValue {
    return {type: 'ArrayMatch', active, value: {array, match}};
}
