import {Action} from './reducer';

export type Dispatch = (action: Action) => void;

export interface StringValue {
    type: 'String';
    value: string | null;
}
export interface NumberValue {
    type: 'Number';
    value: number | null;
}
export interface ArrayValue {
    type: 'Array';
    value: string[];
}
export interface StringMatch {
    type: 'StringMatch';
    value: {string: string | null; match: 'has' | 'sw' | 'eq'};
}
export interface ArrayMatch {
    type: 'ArrayMatch';
    value: {array: string[]; match: 'all' | 'some' | 'eq'};
}
export interface NumberMatch {
    type: 'NumberMatch';
    value: {number: number | null; match: 'gt' | 'lt' | 'eq'};
}
export type Value =
    | StringValue
    | NumberValue
    | ArrayValue
    | StringMatch
    | ArrayMatch
    | NumberMatch;

export interface Filter {
    // [key: string]: Value;
    color: StringValue;
    generation: StringValue;
    shape: StringValue;
    species: StringMatch;
    type: ArrayMatch;
    weight: NumberMatch;
}

export type SortField = {
    id: string;
    reverse: boolean;
};

export interface Search {
    fields: string[];
    sort: SortField[];
    filter: Filter;
    active: (keyof Filter)[];
}

export interface State {
    autoSubmit: boolean;
    refreshCounter: number;
    currentSearch: keyof State['searches'];
    pendingSearch: null | keyof State['searches'];
    searchCounter: number;
    searches: {
        default: Search;
        [key: string]: Search;
        [key: number]: Search;
    };
}
