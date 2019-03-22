import React, {useEffect, useState} from 'react';
import {useQuery} from 'react-apollo-hooks';
import gql from 'graphql-tag';
import {Query} from 'react-apollo';

import {State, Dispatch, Search, Language} from './state/types';
import Table, {Column} from './Table';
import styles from './SearchResults.module.scss';

function NoImageSVG() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 44 44"
        >
            <g transform="translate(-281 -1003)">
                <g
                    transform="translate(281 1003)"
                    fill="#f9f9f9"
                    stroke="#d7d7cf"
                    strokeWidth="3"
                >
                    <rect width="44" height="44" stroke="none" />
                    <rect x="1.5" y="1.5" width="41" height="41" fill="none" />
                </g>
                <rect
                    width="14.127"
                    height="3.532"
                    transform="translate(296.757 1028.746) rotate(-45)"
                    fill="#d7d7cf"
                />
                <rect
                    width="14.127"
                    height="3.532"
                    transform="translate(299.254 1018.757) rotate(45)"
                    fill="#d7d7cf"
                />
            </g>
        </svg>
    );
}

function ImageCell({src}) {
    return (
        <span className={styles['wrapper']}>
            {src ? (
                <>
                    <img
                        className={styles['dummy']}
                        src={src}
                        alt=""
                        style={{imageRendering: 'pixelated'}}
                    />
                    <img src={src} alt="" style={{imageRendering: 'pixelated'}} />
                </>
            ) : (
                <>
                    <span className={styles['dummy']}>
                        <NoImageSVG />
                    </span>
                    <span>
                        <NoImageSVG />
                    </span>
                </>
            )}
        </span>
    );
}

export const columns = [
    {
        id: 'veekun',
        header: 'Link',
        accessor: 'idName',
        render: value => <a href={`https://veekun.com/dex/pokemon/${value}`}>View</a>,
    },
    {id: 'index', header: '#', accessor: 'index'},
    {
        id: 'order',
        header: 'Order',
        accessor: 'order',
    },
    {
        id: 'image-fd',
        header: 'Image (Front Default)',
        accessor: pokemon => pokemon.sprites.frontDefault,
        className: styles['image-cell'],
        render: value => <ImageCell src={value} />,
    },
    {
        id: 'image-bd',
        header: 'Image (Back Default)',
        accessor: pokemon => pokemon.sprites.backDefault,
        className: styles['image-cell'],
        render: value => <ImageCell src={value} />,
    },
    {
        id: 'idName',
        header: 'ID',
        accessor: 'idName',
    },
    {
        id: 'height',
        header: 'Height',
        accessor: 'height',
        render: value => <>{value}&nbsp;cm</>,
    },
    {
        id: 'weight',
        header: 'Weight',
        accessor: 'weight',
        render: value => <>{value}&nbsp;kg</>,
    },
    {
        id: 'color',
        header: 'Colour',
        accessor: pokemon =>
            pokemon.species.color.names.length
                ? pokemon.species.color.names[0].text
                : pokemon.species.color.idName,
        className: styles['color-cell'],
        render: (value, pokemon) => (
            <span className={styles[pokemon.species.color.idName]} title={value}>
                {value}
            </span>
        ),
    },
    {
        id: 'species',
        header: 'Species',
        accessor: pokemon =>
            pokemon.species.names.length
                ? pokemon.species.names[0].text
                : pokemon.species.idName,
    },
    {
        id: 'type',
        header: 'Type',
        accessor: pokemon =>
            pokemon.types
                .sort((a, b) => a.order - b.order)
                .map(type => ({
                    name: type.type.names.length
                        ? type.type.names[0].text
                        : type.type.idName,
                    id: type.type.idName,
                })),
        className: styles['types-cell'],
        render: types =>
            types.map(type => (
                <span key={type.id} className={styles[type.id]}>
                    {type.name}
                </span>
            )),
    },
    {
        id: 'is-default',
        header: 'Is Default',
        accessor: pokemon => (pokemon.isDefault ? 'Yes' : 'No'),
    },
    {
        id: 'generation',
        header: 'Generation',
        accessor: pokemon =>
            pokemon.species.generation.names.length
                ? pokemon.species.generation.names[0].text
                : pokemon.species.generation.idName,
        // render: value => <nobr>{value}</nobr>,
    },
];

const QUERY = gql`
    query(
        $lang: [String]
        $quantity: Int
        $orderBy: [PokemonSort]
        $type: ListFilter
        $color: ID
        $shape: ID
        $generation: ID
        $species: TextFilter
        $weight: IntFilter
    ) {
        pokemons(
            first: $quantity
            where: {
                types: $type
                species: {
                    color__idName: [$color]
                    shape__idName: [$shape]
                    generation__idName: [$generation]
                    name: $species
                }
                weight: $weight
            }
            orderBy: $orderBy
        ) {
            totalCount
            edges {
                node {
                    idName
                    isDefault
                    weight
                    height
                    order
                    types {
                        order
                        type {
                            idName
                            names(lang: $lang) {
                                text
                            }
                        }
                    }
                    species {
                        names(lang: $lang) {
                            text
                        }
                        color {
                            idName
                            names(lang: $lang) {
                                text
                            }
                        }
                        generation {
                            idName
                            names(lang: $lang) {
                                text
                            }
                        }
                    }
                    sprites {
                        frontDefault
                        frontShiny
                        backDefault
                        backShiny
                    }
                }
            }
        }
    }
`;

type Props = {
    languages: Language[];
    currentSearch: Search;
    refreshCounter: number;
    dispatch: Dispatch;
};

export default function SearchResults({
    languages,
    currentSearch,
    refreshCounter,
    dispatch,
}: Props) {
    const {type, color, shape, generation, species, weight} = currentSearch.filter;
    const variables = {
        lang: languages,
        orderBy: currentSearch.sort.map(o => {
            // return {order: o.reverse ? 'DESC' : 'ASC', id: o.id};
            return {
                order: currentSearch.sort[0].reverse ? 'DESC' : 'ASC',
                field: o.id,
            };
        }),
        quantity: 1000,
        type:
            type.active && type.value !== null
                ? {[type.value.match]: type.value.array}
                : null,
        color: color.active ? color.value : null,
        shape: shape.active ? shape.value : null,
        generation: generation.active ? generation.value : null,
        species:
            species.active && species.value !== null
                ? {[species.value.match]: species.value.string, lang: languages[0]}
                : null,
        weight:
            weight.active && weight.value !== null
                ? {[weight.value.match]: weight.value.number}
                : null,
    };

    const [bypassCache, setBypassCache] = useState(false);
    const [savedData, setSavedData] = useState<any | void>(null);

    let {data, refetch, loading, error} = useQuery(QUERY, {
        variables,
        fetchPolicy: bypassCache ? 'network-only' : 'cache-first',
    });

    useEffect(() => {
        if (!loading && !error) {
            setSavedData(data);
            setBypassCache(false);
        }
    }, [loading, error, data]);

    // useEffect(() => {
    //     console.log('Loading:', loading);
    //     dispatch({type: 'set_is_loading', value: loading});
    // }, [loading]);

    useEffect(() => {
        setBypassCache(true);
        refetch();
    }, [refreshCounter]);

    if (savedData) {
        return (
            <Table
                data={savedData.pokemons.edges.map((edge, index) => ({
                    ...edge.node,
                    index: index + 1,
                }))}
                columns={currentSearch.fields.map(
                    id => columns.find(col => col.id === id) as Column
                )}
            />
        );
    }
    return null;
}
