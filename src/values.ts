import {decode} from 'punycode';

export class Filter {
    constructor(
        public color = new StringValue(''),
        public generation = new StringValue('generation-i'),
        public shape = new StringValue(''),
        public species = new TextMatchValue('has', ''),
        public type = new ListMatchValue('all', []),
        public weight = new NumberMatchValue('gt', null)
    ) {}
    copy() {
        const copy = new Filter();
        for (const [key, value] of Object.entries(this)) {
            copy[key] = value;
        }
        return copy;
    }
}

interface Value {
    toString(): string;
    fromString(string: string): void;
}

export class StringValue implements Value {
    constructor(public value: string) {}
    toString() {
        return this.value + '';
    }
    fromString(string: string) {
        this.value = string;
    }
}

type ListMatch = 'all' | 'some' | 'eq';
export class ListMatchValue implements Value {
    constructor(public match: ListMatch, public value: string[]) {}
    toString() {
        return `${this.match}~${encodeArray(this.value)}`;
    }
    fromString(string: string) {
        const match = string.match(/^([all|some|eq])~(.+)$/);
        if (match) {
            this.match = match[1] as ListMatch;
            this.value = decodeArray(match[2]);
        }
    }
}

type TextMatch = 'has' | 'sw' | 'eq';
export class TextMatchValue implements Value {
    constructor(public match: TextMatch, public value: string) {}
    toString() {
        return `${this.match}~${this.value}`;
    }
    fromString(string: string) {
        const match = string.match(/^([has|sw|eq])~(.+)$/);
        if (match) {
            this.match = match[1] as TextMatch;
            this.value = match[2];
        }
    }
}

type NumberMatch = 'lt' | 'gt' | 'eq';
export class NumberMatchValue implements Value {
    constructor(public match: NumberMatch, public value: number | null) {}
    toString() {
        return `${this.match}~${this.value}`;
    }
    fromString(string: string) {
        const match = string.match(/^([lt|gt|eq])~(\d+)$/);
        if (match) {
            this.match = match[1] as NumberMatch;
            this.value = parseFloat(match[2]);
        }
    }
}

function encodeArray(array) {
    if (!array) {
        return '';
    }
    return array.join('_');
}

function decodeArray(arrayStr) {
    if (!arrayStr) {
        return [];
    }
    return arrayStr.split('_').map(item => (item === '' ? undefined : item));
}
