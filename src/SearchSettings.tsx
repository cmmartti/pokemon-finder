import React, {useEffect} from 'react';

import Filter from './Filter';
import SortableInput from './controls/SortableInput';
import {columns} from './SearchResults';
import styles from './SearchSettings.module.scss';
import {State, Dispatch} from './state/types';
import {SortField} from './state/types';

function Section({label, children}) {
    return (
        <div className={styles['section']}>
            <h3 className={styles['label']}>{label}</h3>
            <div className={styles['content']}>{children}</div>
        </div>
    );
}

function convertValue(options, optionIds) {
    const o = [] as string[];
    for (const id of optionIds) {
        const option = options.find(option => option.id === id);
        if (option) o.push(option);
    }
    return o;
}

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

type Props = {state: State; dispatch: Dispatch};

function SearchSettings({state, dispatch}: Props) {
    function handleKeyPress(event) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            if (state.search.pending) {
                dispatch({type: 'submit_pending'});
            } else {
                dispatch({type: 'refresh'});
            }
        }
    }

    useEffect(() => {
        window.addEventListener('keypress', handleKeyPress);
        return function cleanUp() {
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, []);

    function OptionAction({data, isSelected}) {
        return (
            <button
                className={styles['sort-button']}
                onClick={() => {
                    const {sort} = search;
                    const index = sort.findIndex(s => s.id === data.id);
                    dispatch({
                        type: 'set_search_sort',

                        // Due to API restrictions, set all sort directions to be the same
                        sort: sort.map(s => ({...s, reverse: !sort[0].reverse})),
                        // sort: [
                        //     ...sort.slice(0, index),
                        //     {...data, reverse: !data.reverse},
                        //     ...sort.slice(index + 1, sort.length),
                        // ],
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
                <Section label="Filter">
                    <Filter
                        state={state}
                        dispatch={dispatch}
                        filter={
                            state.search.pending
                                ? state.search.pending.filter
                                : state.search.current.filter
                        }
                    />
                </Section>
                <Section label="Sort">
                    <SortableInput
                        options={sortOptions}
                        value={convertSort(sortOptions, search.sort)}
                        onChange={sort => dispatch({type: 'set_search_sort', sort})}
                        OptionAction={OptionAction}
                        themeClassName={styles['sort-theme']}
                    />
                </Section>
                <Section label="Fields">
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
                </Section>
                <div className={styles['submit-section']}>
                    <div className={styles['status']}>
                        {state.isLoading && (
                            <div
                                className={styles['loading-spinner']}
                                title="Loading"
                                aria-label="Loading"
                            />
                        )}
                    </div>
                    <div className={styles['controls']}>
                        {state.search.pending ? (
                            <>
                                <button
                                    className={
                                        styles['button'] + ' ' + styles['button--alert']
                                    }
                                    onClick={() => dispatch({type: 'submit_pending'})}
                                >
                                    Search
                                </button>
                                <button
                                    className={styles['link-button']}
                                    onClick={() => dispatch({type: 'clear_pending'})}
                                >
                                    Clear changes
                                </button>
                            </>
                        ) : (
                            <button
                                className={styles['button']}
                                onClick={() => dispatch({type: 'refresh'})}
                            >
                                Refresh
                            </button>
                        )}

                        <div className={styles['spring-spacer']} />

                        <label>
                            <input
                                type="checkbox"
                                checked={state.autoSubmit}
                                onChange={event =>
                                    dispatch({
                                        type: 'set_auto_submit',
                                        value: event.target.checked,
                                    })
                                }
                            />{' '}
                            Auto-submit
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchSettings;
