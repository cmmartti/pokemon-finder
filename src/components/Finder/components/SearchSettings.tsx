import React from 'react';

import styles from './SearchSettings.module.scss';
import {Dispatch} from '../state';

type Props = {
    isPending: boolean;
    autoSubmit: boolean;
    dispatch: Dispatch;
    isLoading: boolean;
};

function SearchSettings({isPending, autoSubmit, dispatch, isLoading}: Props) {
    return (
        <div className={styles['submit-section']}>
            <div className={styles['status']}>
                {isLoading && (
                    <div
                        className={styles['loading-spinner']}
                        title="Loading"
                        aria-label="Loading"
                        aria-live="polite"
                        role="status"
                    />
                )}
            </div>
            <div className={styles['controls']}>
                {isPending ? (
                    <>
                        <button
                            className={styles['button'] + ' ' + styles['button--alert']}
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
                        checked={autoSubmit}
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
    );
}

export default SearchSettings;
