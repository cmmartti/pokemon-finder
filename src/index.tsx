import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
import {ApolloProvider as ApolloProviderHooks} from 'react-apollo-hooks';
import createHistory from 'history/createBrowserHistory';
import 'sanitize.css';
import 'focus-visible/dist/focus-visible.min.js';

import GlobalErrorBoundary from './GlobalErrorBoundary';
import useAppState from './state/useAppState';
import Header from './Header';
import SearchSettings from './SearchSettings';
import SearchResults from './SearchResults';
import './index.scss';

const history = createHistory();
// const client = new ApolloClient({uri: 'http://localhost:8000/graphql'});
const client = new ApolloClient({uri: 'http://pokeapi.charlesmarttinen.ca/graphql'});

function Application() {
    const [state, dispatch] = useAppState(history);
    return (
        <GlobalErrorBoundary>
            <ApolloProvider client={client}>
                <ApolloProviderHooks client={client}>
                    <Header state={state} dispatch={dispatch} />
                    <SearchSettings state={state} dispatch={dispatch} />
                    <SearchResults state={state} dispatch={dispatch} />
                </ApolloProviderHooks>
            </ApolloProvider>
        </GlobalErrorBoundary>
    );
}

ReactDOM.render(<Application />, document.getElementById('root'));
