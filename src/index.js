import React from 'react';
import ReactDOM from 'react-dom';

import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
import {ApolloProvider as ApolloProviderHooks} from 'react-apollo-hooks';

import createHistory from 'history/createBrowserHistory';
import {configureUrlQuery, addUrlProps} from 'react-url-query';

import 'sanitize.css';
import 'focus-visible/dist/focus-visible.min.js';

import PokemonFinder from './PokemonFinder';
import GlobalErrorBoundary from './GlobalErrorBoundary';
import {mapUrlToProps, mapUrlChangeHandlersToProps} from './url-query';
import './index.scss';

const history = createHistory();
configureUrlQuery({history});

const client = new ApolloClient({
    uri: 'http://localhost:8000/graphql',
    // uri: 'http://192.168.2.76:801/graphql',
});

const PokemonFinderContainer = addUrlProps({mapUrlToProps, mapUrlChangeHandlersToProps})(
    PokemonFinder
);

class App extends React.Component {
    componentDidMount() {
        // Force an update if the URL changes
        history.listen(() => this.forceUpdate());
    }
    render() {
        return (
            <GlobalErrorBoundary>
                <ApolloProvider client={client}>
                    <ApolloProviderHooks client={client}>
                        <header className="site-header">
                            <h1 className="site-header__title">Pokémon Finder</h1>
                            <h2 className="site-header__subtitle">
                                Built with{' '}
                                <a href="https://pokeapi.co">PokéAPI GraphQL</a>
                                <br />
                                by{' '}
                                <a href="https://charlesmarttinen.ca">
                                    Charles Marttinen
                                </a>
                            </h2>
                        </header>

                        <React.Suspense fallback={<p>Loading...</p>}>
                            <PokemonFinderContainer />
                        </React.Suspense>
                    </ApolloProviderHooks>
                </ApolloProvider>
            </GlobalErrorBoundary>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
