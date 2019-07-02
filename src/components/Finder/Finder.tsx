import React, {useState} from 'react';

import {useAppState} from './state';

import Filter from './components/Filter';
import Sort from './components/Sort';
import Field from './components/Field';
import SearchSettings from './components/SearchSettings';
import SearchResults from './components/SearchResults';

import styles from './components/SearchSettings.module.scss';

function Section({name, children}) {
    return (
        <div className={styles['section']}>
            <h3 className={styles['name']}>{name}</h3>
            <div className={styles['content']}>{children}</div>
        </div>
    );
}

interface Props {
    language: string;
}

export default function Finder({language}: Props) {
    const [state, dispatch] = useAppState();
    const [isLoading, setIsLoading] = useState(false);

    const search = state.searches[state.pendingSearch || state.currentSearch];

    return (
        <>
            <div className={styles['settings']}>
                <Section name="Filter">
                    <Filter
                        language={language}
                        dispatch={dispatch}
                        filter={search.filter}
                        active={search.active}
                        // Don't submit the filter on every keypress unless the entire
                        // search is in manual submit mode:
                        submitOnChange={!state.autoSubmit}
                    />
                </Section>
                <Section name="Sort">
                    <Sort
                        sort={search.sort}
                        setSort={sort => dispatch({type: 'set_search_sort', sort})}
                    />
                </Section>
                <Section name="Fields">
                    <Field
                        fields={search.fields}
                        setFields={fields =>
                            dispatch({type: 'set_search_fields', fields})
                        }
                    />
                </Section>

                <SearchSettings
                    isPending={!!state.pendingSearch}
                    isLoading={isLoading}
                    autoSubmit={state.autoSubmit}
                    dispatch={dispatch}
                />
            </div>

            <SearchResults
                language={language}
                currentSearch={state.searches[state.currentSearch]}
                setIsLoading={setIsLoading}
                refreshCounter={state.refreshCounter}
            />
        </>
    );
}
