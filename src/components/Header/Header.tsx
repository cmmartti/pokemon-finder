import React from 'react';

import styles from './Header.module.scss';
import {SingleSelect} from '../Select';
import {languages} from '../../utils/useLanguage';

export default function Header({language, setLanguage}) {
    return (
        <header className={styles['header']}>
            <div className={styles['top']}>
                <div className={styles['title']}>
                    <h1>Pokémon Finder</h1>
                    <p>
                        by <a href="https://charlesmarttinen.ca">Charles Marttinen</a>
                    </p>
                </div>
                <div className={styles['language']}>
                    <label>
                        Language:{' '}
                        <SingleSelect
                            value={languages.find(opt => opt.id === language)}
                            onChange={opt => setLanguage(opt.id)}
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
        </header>
    );
}
