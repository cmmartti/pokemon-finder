import React, {useState, useEffect} from 'react';
import {useQuery} from 'urql';
import {loader} from 'graphql.macro';

import {Search, Filter} from '../state';
import {Table, Column} from '../../Table';
import fields from '../fields';

const query = loader('../query.graphql');

type Props = {
    language: string;
    currentSearch: Search;
    setIsLoading: (isLoading: boolean) => any;
    refreshCounter: number;
};

export default function SearchResults({
    setIsLoading,
    language,
    currentSearch,
    refreshCounter,
}: Props) {
    const variables = {
        lang: language,
        orderBy: currentSearch.sort.map(o => {
            // return {order: o.reverse ? 'DESC' : 'ASC', field: o.id};
            return {
                order: currentSearch.sort[0].reverse ? 'DESC' : 'ASC',
                field: o.id,
            };
        }),
    };

    type FilterResolvers = {[P in keyof Filter]: (value: Filter[P]['value']) => any};
    const filterResolvers: FilterResolvers = {
        color: val => val,
        shape: val => val,
        generation: val => val,
        type: ({array, match}) => (array.length > 0 ? {[match]: array} : null),
        weight: ({number, match}) => (number !== null ? {[match]: number} : null),
        species: ({string, match}) => (string ? {[match]: string, lang: language} : null),
    };

    // Set inactive filter variables to null
    for (const [id, {value}] of Object.entries(currentSearch.filter)) {
        if (currentSearch.active.includes(id as keyof Filter)) {
            variables[id] = filterResolvers[id](value);
        } else {
            variables[id] = null;
        }
    }

    let [res, executeQuery] = useQuery({query, variables});
    setIsLoading(res.fetching);

    // Keep previous data while new data is loading (loading spinner indicates activity)
    const [tableData, setTableData] = useState<any>(null);
    useEffect(() => {
        if (res.data) {
            setTableData(res.data);
        }
    }, [res]);

    // When the refreshCounter changes, request new data (no cache)
    useEffect(() => {
        if (!res.fetching) {
            executeQuery({requestPolicy: 'network-only'});
        }
    }, [refreshCounter]);

    if (tableData) {
        const data = tableData!.pokemons.edges.map((edge, index) => ({
            ...edge.node,
            index: index + 1,
        }));
        const columns = currentSearch.fields.map(
            id => fields.find(col => col.id === id) as Column
        );

        return <Table data={data} columns={columns} />;
    }

    if (res.fetching) {
        return <p>Loading…</p>;
    }
    return null;
}
