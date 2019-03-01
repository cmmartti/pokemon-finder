import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
import {ApolloProvider as ApolloProviderHooks} from 'react-apollo-hooks';
import createHistory from 'history/createBrowserHistory';
import 'sanitize.css';
import 'focus-visible/dist/focus-visible.min.js';

import GlobalErrorBoundary from './GlobalErrorBoundary';
import StateManager from './state/StateManager';
import PokemonFinder from './PokemonFinder';
import './index.scss';

const uri = 'http://localhost:8000/graphql';
// const uri = 'http://192.168.2.76:801/graphql';
const client = new ApolloClient({uri});

const history = createHistory();

function Application() {
    return (
        <GlobalErrorBoundary>
            <ApolloProvider client={client}>
                <ApolloProviderHooks client={client}>
                    <header className="site-header">
                        <h1 className="site-header__title">Pokémon Finder</h1>
                        <h2 className="site-header__subtitle">
                            Built with <a href="https://pokeapi.co">PokéAPI GraphQL</a>
                            <br />
                            by <a href="https://charlesmarttinen.ca">Charles Marttinen</a>
                        </h2>
                    </header>

                    <React.Suspense fallback={<p>Loading...</p>}>
                        <StateManager history={history}>
                            {(state, dispatch) => (
                                <PokemonFinder state={state} dispatch={dispatch} />
                            )}
                        </StateManager>
                    </React.Suspense>
                </ApolloProviderHooks>
            </ApolloProvider>
        </GlobalErrorBoundary>
    );
}

ReactDOM.render(<Application />, document.getElementById('root'));
