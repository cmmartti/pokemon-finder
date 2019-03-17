import React from 'react';

import {State, Dispatch} from './state/types';
import {SingleSelect} from './controls/Select';
import styles from './Header.module.scss';

const languages = [
    {id: 'cz', label: 'CZ'},
    {id: 'de', label: 'DE'},
    {id: 'en', label: 'EN'},
    {id: 'es', label: 'ES'},
    {id: 'fr', label: 'FR'},
    {id: 'it', label: 'IT'},
    {id: 'ja-Hrkt', label: 'JP'},
    {id: 'ko', label: 'KR'},
];

type Props = {
    state: State;
    dispatch: Dispatch;
};

export default function Header({state, dispatch}: Props) {
    return (
        <header className={styles['header']}>
            <div className={styles['top']}>
                <div className={styles['title']}>
                    <h1>Pokémon Finder </h1>
                    <p>
                        by <a href="https://charlesmarttinen.ca">Charles Marttinen</a>
                    </p>
                </div>

                <div className={styles['language']}>
                    <label>
                        Language:{' '}
                        <SingleSelect
                            value={languages.find(opt => opt.id === state.languages[0])}
                            onChange={opt =>
                                dispatch({
                                    type: 'set_languages',
                                    languages: opt.id === 'en' ? ['en'] : [opt.id, 'en'],
                                })
                            }
                            options={languages}
                        />
                    </label>
                </div>
            </div>

            <p className={styles['links']}>
                Uses <a href="https://pokeapi.co">PokéAPI's GraphQL API</a>
                {' • '}
                <a href="https://github.com/cmmartti/pokemon-finder">
                    View this project on GitHub
                </a>
            </p>

            {/* <div className={styles['view-settings']}>
                <label>
                    <input
                        type="checkbox"
                        checked={state.printPreview}
                        onChange={event =>
                            dispatch({
                                type: 'set_print_preview',
                                value: event.target.checked,
                            })
                        }
                    />{' '}
                    Print preview
                </label>
            </div> */}
        </header>
    );
}
