import React from 'react';

import Filter from './Filter';
import SortableInput from './controls/SortableInput';
import ResultsTable, {columns} from './ResultsTable';
import styles from './PokemonFinder.module.scss';

function ViewSettingsSection({label, children}) {
    return (
        <div className={styles['section']}>
            <h3 className={styles['label']}>{label}</h3>
            <div className={styles['content']}>{children}</div>
        </div>
    );
}

function convertValue(options, optionIds) {
    return optionIds.map(id => options.find(option => option.id === id));
}

function convertSort(sortOptions, sort) {
    return sort.map(({id, direction}) => {
        return {
            ...sortOptions.find(option => option.id === id),
            direction,
        };
    });
}

function PokemonFinder({
    filters,
    setFilter,
    setActive,
    fields,
    setFields,
    sort,
    setSort,
    languages,
    setLanguages,
}) {
    function OptionAction({data, isSelected}) {
        return (
            <button
                className={styles['sort-button']}
                onClick={() => {
                    const index = sort.findIndex(s => s.id === data.id);
                    setSort([
                        ...sort.slice(0, index),
                        {...data, direction: data.direction === 'ASC' ? 'DESC' : 'ASC'},
                        ...sort.slice(index + 1, sort.length),
                    ]);
                }}
                disabled={!isSelected}
                key={data.id}
                aria-label={
                    data.direction === 'ASC'
                        ? `Switch ${data.Header} sort to descending order`
                        : `Switch ${data.Header} sort to ascending order`
                }
                title={data.direction === 'ASC' ? 'Ascending' : 'Descending'}
            >
                {data.direction === 'ASC' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M7 10v8h6v-8h5l-8-8-8 8h5z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M7 10V2h6v8h5l-8 8-8-8h5z" />
                    </svg>
                )}
            </button>
        );
    }

    const sortOptions = [
        {id: 'order', header: 'Order', direction: 'ASC'},
        {id: 'height', header: 'Height', direction: 'ASC'},
        {id: 'isDefault', header: 'Is Default', direction: 'ASC'},
        {id: 'weight', header: 'Weight', direction: 'ASC'},
    ];

    return (
        <div>
            <div className={styles['settings']}>
                <ViewSettingsSection label="Filter">
                    <Filter
                        filters={filters}
                        languages={languages}
                        update={setFilter}
                        setActive={setActive}
                    />
                </ViewSettingsSection>
                <ViewSettingsSection label="Sort*">
                    <SortableInput
                        options={sortOptions}
                        value={convertSort(sortOptions, sort)}
                        onChange={setSort}
                        OptionAction={OptionAction}
                        themeClassName={styles['sort-theme']}
                    />
                </ViewSettingsSection>
                <ViewSettingsSection label="Fields">
                    <SortableInput
                        options={columns}
                        value={convertValue(columns, fields)}
                        onChange={setFields}
                        themeClassName={styles['field-theme']}
                    />
                </ViewSettingsSection>
            </div>
            {/* <p>
                * Note: Due to API limitations, all sort directions (ascending/descending)
                except the first are ignored. This may change in the future.
            </p> */}

            <React.Suspense fallback={<p>Loading results...</p>}>
                <ResultsTable
                    language={languages}
                    orderBy={sort}
                    filters={filters}
                    columnOrder={fields}
                />
            </React.Suspense>
        </div>
    );
}

export default PokemonFinder;
