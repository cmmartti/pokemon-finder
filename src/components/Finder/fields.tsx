import React from 'react';

import {Column} from '../Table';
import styles from './components/SearchResults.module.scss';
import ImageCell from './components/ImageCell';

const fields: Column[] = [
    {
        id: 'veekun',
        name: 'Link',
        accessor: 'idName',
        render: value => <a href={`https://veekun.com/dex/pokemon/${value}`}>View</a>,
    },
    {id: 'index', name: '#', accessor: 'index'},
    {
        id: 'order',
        name: 'Order',
        accessor: 'order',
    },
    {
        id: 'image-fd',
        name: 'Image (Front Default)',
        accessor: pokemon => pokemon.sprites.frontDefault,
        className: styles['image-cell'],
        render: value => <ImageCell src={value} />,
    },
    {
        id: 'image-bd',
        name: 'Image (Back Default)',
        accessor: pokemon => pokemon.sprites.backDefault,
        className: styles['image-cell'],
        render: value => <ImageCell src={value} />,
    },
    {
        id: 'idName',
        name: 'ID',
        accessor: 'idName',
    },
    {
        id: 'height',
        name: 'Height',
        accessor: 'height',
        render: value => <>{value}&nbsp;cm</>,
    },
    {
        id: 'weight',
        name: 'Weight',
        accessor: 'weight',
        render: value => <>{value}&nbsp;kg</>,
    },
    {
        id: 'color',
        name: 'Colour',
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
        name: 'Species',
        accessor: pokemon =>
            pokemon.species.names.length
                ? pokemon.species.names[0].text
                : pokemon.species.idName,
    },
    {
        id: 'type',
        name: 'Type',
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
        name: 'Is Default',
        accessor: pokemon => (pokemon.isDefault ? 'Yes' : 'No'),
    },
    {
        id: 'shape',
        name: 'Shape',
        accessor: pokemon =>
            pokemon.species.shape.names.length
                ? pokemon.species.shape.names[0].text
                : pokemon.species.shape.idName,
    },
    {
        id: 'generation',
        name: 'Generation',
        accessor: pokemon =>
            pokemon.species.generation.names.length
                ? pokemon.species.generation.names[0].text
                : pokemon.species.generation.idName,
        // render: value => <nobr>{value}</nobr>,
    },
];

export default fields;
