import React from 'react';

import SortableInput from './SortableInput';
import styles from './SearchSettings.module.scss';
import {SortField} from '../state';

function convertSort(sortOptions, sort) {
    const s = [] as SortField[];
    for (const {id, reverse} of sort) {
        const sortField = sortOptions.find(option => option.id === id);
        if (sortField) {
            s.push({...sortField, reverse});
        }
    }
    return s;
}

type Props = {
    sort: SortField[];
    setSort: (sort: SortField[]) => void;
};

const sortOptions = [
    {id: 'order', name: 'Order', reverse: false},
    {id: 'height', name: 'Height', reverse: false},
    {id: 'isDefault', name: 'Is Default', reverse: false},
    {id: 'weight', name: 'Weight', reverse: false},
];

export default function Sort({sort, setSort}: Props) {
    /** Sort direction arrow on sort fields. */
    function SortDirection({data, isSelected}) {
        return (
            <button
                className={styles['sort-button']}
                onClick={() => {
                    // Due to API restrictions, set all sort directions to be the same
                    // setSort(sort.map(s => ({...s, reverse: !sort[0].reverse})));

                    // Without API restrictions
                    const index = sort.findIndex(s => s.id === data.id);
                    setSort([
                        ...sort.slice(0, index),
                        {...data, reverse: !data.reverse},
                        ...sort.slice(index + 1, sort.length),
                    ]);
                }}
                disabled={!isSelected}
                key={data.id}
                aria-label={
                    data.reverse
                        ? `Switch ${data.Header} sort to ascending order`
                        : `Switch ${data.Header} sort to descending order`
                }
                title={data.reverse ? 'Descending' : 'Ascending'}
            >
                {data.reverse ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M7 10V2h6v8h5l-8 8-8-8h5z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M7 10v8h6v-8h5l-8-8-8 8h5z" />
                    </svg>
                )}
            </button>
        );
    }

    return (
        <SortableInput
            options={sortOptions}
            value={convertSort(sortOptions, sort)}
            onChange={setSort}
            OptionAction={SortDirection}
            themeClassName={styles['sort-theme']}
        />
    );
}
