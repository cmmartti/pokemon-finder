import React from 'react';
import ReactDOM from 'react-dom';

import ErrorBoundary from './ErrorBoundary';
import useAppState from './state/useAppState';
import Header from './Header';
import SearchSettings from './SearchSettings';
import SearchResults from './SearchResults';

export default function App({history, isLoading, error}) {
    const [state, dispatch] = useAppState(history);
    return (
        <>
            <Header state={state} dispatch={dispatch} />
            <ErrorBoundary>
                {error && error.networkError && !error.networkError.response && (
                    <p>
                        Can't connect to the network.{' '}
                        <button onClick={() => dispatch({type: 'refresh'})}>
                            Try to re-connect
                        </button>
                    </p>
                )}
                {error && error.networkError && error.networkError.response && (
                    <p>Network Error {error.networkError.statusCode}</p>
                )}
                {error && error.graphQLErrors && <p>Application Error (GraphQL).</p>}
                <SearchSettings isLoading={isLoading} state={state} dispatch={dispatch} />
                <SearchResults
                    languages={state.languages}
                    currentSearch={state.search.current}
                    refreshCounter={state.refreshCounter}
                    dispatch={dispatch}
                />
            </ErrorBoundary>
        </>
    );
}
