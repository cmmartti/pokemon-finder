import React from 'react';
import {Provider as GraphQLProvider, createClient} from 'urql';

import useLanguage from '../utils/useLanguage';
import ErrorBoundary from './ErrorBoundary';
import Header from './Header';
import Finder from './Finder';

const client = createClient({url: 'https://pokeapi.charlesmarttinen.ca/graphql'});

export default function App() {
    const [language, setLanguage] = useLanguage('en');

    return (
        <ErrorBoundary>
            <GraphQLProvider value={client}>
                <Header language={language} setLanguage={setLanguage} />
                <Finder language={language} />
            </GraphQLProvider>
        </ErrorBoundary>
    );
}
