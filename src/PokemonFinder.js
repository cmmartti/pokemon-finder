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
    return sort.map(({id, reverse}) => {
        return {
            ...sortOptions.find(option => option.id === id),
            reverse,
        };
    });
}

function PokemonFinder({state, dispatch}) {
    function OptionAction({data, isSelected}) {
        return (
            <button
                className={styles['sort-button']}
                onClick={() => {
                    const {sort} = search;
                    const index = sort.findIndex(s => s.id === data.id);
                    dispatch({
                        type: 'set_search_sort',
                        sort: [
                            ...sort.slice(0, index),
                            {...data, reverse: !data.reverse},
                            ...sort.slice(index + 1, sort.length),
                        ],
                    });
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

    const sortOptions = [
        {id: 'order', header: 'Order', reverse: false},
        {id: 'height', header: 'Height', reverse: false},
        {id: 'isDefault', header: 'Is Default', reverse: false},
        {id: 'weight', header: 'Weight', reverse: false},
    ];

    const search = state.search.pending || state.search.current;

    return (
        <div>
            <div className={styles['settings']}>
                <ViewSettingsSection label="Filter">
                    <Filter state={state} dispatch={dispatch} />
                </ViewSettingsSection>
                <ViewSettingsSection label="Sort*">
                    <SortableInput
                        options={sortOptions}
                        value={convertSort(sortOptions, search.sort)}
                        onChange={sort => dispatch({type: 'set_search_sort', sort})}
                        OptionAction={OptionAction}
                        themeClassName={styles['sort-theme']}
                    />
                </ViewSettingsSection>
                <ViewSettingsSection label="Fields">
                    <SortableInput
                        options={columns}
                        value={convertValue(columns, search.fields)}
                        onChange={fields =>
                            dispatch({
                                type: 'set_search_fields',
                                fields: fields.map(field => field.id),
                            })
                        }
                        themeClassName={styles['field-theme']}
                    />
                </ViewSettingsSection>
            </div>
            <label>
                <input
                    type="checkbox"
                    checked={state.autoSubmit}
                    onChange={e =>
                        dispatch({type: 'set_auto_submit', value: e.target.checked})
                    }
                />{' '}
                Auto-submit
            </label>
            <button
                onClick={() => dispatch({type: 'submit_pending'})}
                disabled={!state.search.pending}
            >
                Submit
            </button>

            <React.Suspense fallback={<p>Loading results...</p>}>
                <ResultsTable state={state} />
            </React.Suspense>
        </div>
    );
}

export default PokemonFinder;
