import React from 'react';

import {useQuery} from 'react-apollo-hooks';
import gql from 'graphql-tag';
import styles from './ResultsTable.module.scss';

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
            <span className={styles[pokemon.species.color.idName]} title={value} />
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
        $type: ListFilter
        $color: ID
        $shape: ID
        $generation: ID
        $species: TextFilter
        $weight: IntFilter
        $orderBy: [PokemonSort]
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

export default function ResultsTable({state}) {
    const {type, color, shape, generation, species, weight} = state.search.current.filter;

    const variables = {
        lang: state.languages,
        orderBy: state.search.current.sort.map(o => {
            // return {order: o.reverse ? 'DESC' : 'ASC', id: o.id};
            return {
                order: state.search.current.sort[0].reverse ? 'DESC' : 'ASC',
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
                ? {[species.value.match]: species.value.string, lang: state.languages[0]}
                : null,
        weight:
            weight.active && weight.value !== null
                ? {[weight.value.match]: weight.value.number}
                : null,
    };

    let {data} = useQuery(QUERY, {variables});

    data = data.pokemons.edges.map((edge, index) => ({
        ...edge.node,
        index: index + 1,
    }));

    return (
        <div className={styles['output']}>
            <Table
                data={data}
                columns={state.search.current.fields.map(id =>
                    columns.find(col => col.id === id)
                )}
            />
        </div>
    );
}

function Table({data, columns}) {
    return (
        <table>
            <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.id} className={col.className || null}>
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map(row => (
                    <tr key={row.index}>
                        {columns.map(({accessor, id, render, className}) => {
                            let field;
                            if (typeof accessor === 'string') {
                                field = row[accessor];
                            } else if (typeof accessor === 'function') {
                                field = accessor(row);
                            }

                            return (
                                <td key={id} className={className || null}>
                                    {render ? render(field, row) : field}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
