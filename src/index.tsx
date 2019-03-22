import React, {useState, useReducer, useEffect} from 'react';
import ReactDOM from 'react-dom';
import createHistory from 'history/createBrowserHistory';
import 'sanitize.css';
import 'focus-visible/dist/focus-visible.min.js';

import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {HttpLink} from 'apollo-link-http';
// import {onError} from 'apollo-link-error';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloProvider} from 'react-apollo';
import {ApolloProvider as ApolloProviderHooks} from 'react-apollo-hooks';
import {createNetworkStatusNotifier} from 'react-apollo-network-status';

import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.scss';

const {
    NetworkStatusNotifier,
    link: networkStatusNotifierLink,
} = createNetworkStatusNotifier();

const client = new ApolloClient({
    link: ApolloLink.from([
        networkStatusNotifierLink,
        new HttpLink({uri: 'http://pokeapi.charlesmarttinen.ca/graphql'}),
    ]),
    cache: new InMemoryCache(),
});

const history = createHistory();

function Index() {
    // Force an update if the URL changes
    // const [, forceUpdate] = useReducer(x => x + 1, 0);
    // useEffect(() => {
    //     history.listen(() => forceUpdate({}));
    // }, []);

    return (
        <ErrorBoundary>
            <ApolloProvider client={client}>
                <ApolloProviderHooks client={client}>
                    <NetworkStatusNotifier
                        render={({loading, error}) => (
                            <App history={history} isLoading={loading} error={error} />
                        )}
                    />
                </ApolloProviderHooks>
            </ApolloProvider>
        </ErrorBoundary>
    );
}

ReactDOM.render(<Index />, document.getElementById('root'));
