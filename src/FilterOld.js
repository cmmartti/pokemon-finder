import React, {useState} from 'react';
import {useQuery} from 'react-apollo-hooks';
import gql from 'graphql-tag';

import {SingleSelect, SearchSelect, MultiSelect} from './controls/Select';
import TextPicker from './controls/TextPicker';
import NumberInput from './controls/NumberInput';
import SentenceFilter, {SentencePart as Part} from './controls/SentenceFilter';

const QUERY = gql`
    query($lang: [String]) {
        types(first: 100) {
            edges {
                node {
                    idName
                    names(lang: $lang) {
                        text
                    }
                }
            }
        }
        colors: pokemonColors {
            idName
            names(lang: $lang) {
                text
            }
        }
        shapes: pokemonShapes {
            idName
            names(lang: $lang) {
                text
            }
        }
        generations(first: 100) {
            edges {
                node {
                    idName
                    names(lang: $lang) {
                        text
                    }
                    versionGroups {
                        versions {
                            idName
                            names(lang: $lang) {
                                text
                            }
                        }
                    }
                }
            }
        }
    }
`;

function Number({innerRef, value, setValue}) {
    return (
        <NumberInput
            value={value}
            ref={innerRef}
            onChange={newValue => setValue(newValue)}
        />
    );
}

function Select({innerRef, value, options, setValue}) {
    return (
        <SearchSelect
            ref={innerRef}
            options={options}
            onChange={option => setValue(option ? option.id : null)}
            value={options.find(option => option.id === value)}
        />
    );
}

function Multi({innerRef, value, options, setValue}) {
    let values = [];
    if (value) {
        values = value.map(id => options.find(opt => opt.id === id));
    }
    return (
        <MultiSelect
            ref={innerRef}
            options={options}
            onChange={newOptions =>
                setValue(newOptions ? newOptions.map(opt => opt.id) : null)
            }
            value={values}
        />
    );
}

function SpeciesTextSelect({innerRef, value, method, setValue, languages}) {
    const [search, setSearch] = useState(value);

    const query = gql`
        query($lang: [String], $textFilter: TextFilter!) {
            pokemonSpeciess(first: 10, where: {name: $textFilter}) {
                edges {
                    node {
                        names(lang: $lang) {
                            text
                        }
                    }
                }
            }
        }
    `;
    const {data} = useQuery(query, {
        variables: {
            textFilter: {[method]: search, lang: languages[0]},
            lang: languages,
        },
        suspend: false,
    });

    var suggestions = [];
    if (search && data.pokemonSpeciess) {
        suggestions = data.pokemonSpeciess.edges.map(edge =>
            edge.node.names[0].text.toLowerCase()
        );
    }

    return (
        <TextPicker
            ref={innerRef}
            onSubmit={setValue}
            onChange={newSearch => setSearch(newSearch)}
            suggestions={suggestions}
            value={value}
        />
    );
}

function OperatorSelect({innerRef, operator, setOperator}) {
    const options = [
        {id: 'lt', label: 'less than'},
        {id: 'eq', label: 'equal to'},
        {id: 'gt', label: 'greater than'},
    ];
    return (
        <SingleSelect
            ref={innerRef}
            options={options}
            onChange={newValue => setOperator(newValue.id)}
            name="Comparison operator"
            value={options.find(option => option.id === operator)}
        />
    );
}

function SearchMethodSelect({innerRef, method, setMethod}) {
    const options = [
        {id: 'has', label: 'contain'},
        {id: 'sw', label: 'start with'},
        {id: 'eq', label: 'exactly match'},
    ];
    return (
        <SingleSelect
            ref={innerRef}
            options={options}
            onChange={newValue => setMethod(newValue.id)}
            name="Search method"
            value={options.find(option => option.id === method)}
        />
    );
}

function ListMethodSelect({innerRef, method, setMethod}) {
    const options = [
        {id: 'all', label: 'all of'},
        {id: 'some', label: 'one of'},
        {id: 'eq', label: 'exactly'},
    ];
    return (
        <SingleSelect
            ref={innerRef}
            options={options}
            onChange={newValue => setMethod(newValue.id)}
            name="Search method"
            value={options.find(option => option.id === method)}
        />
    );
}

export default function SearchFilter({filters, update, languages, setActive}) {
    const {data} = useQuery(QUERY, {variables: {lang: languages}});

    const parameters = {
        weight: {
            id: 'weight',
            name: 'Weight',
            active: filters.weight.active,

            value: filters.weight.value,
            setValue: newValue => update('weight', {...filters.weight, value: newValue}),

            operator: filters.weight.operator,
            setOperator: newOperator =>
                update('weight', {...filters.weight, operator: newOperator}),
        },
        color: {
            id: 'color',
            name: 'Colour',
            active: filters.color.active,

            value: filters.color.value,
            options: data.colors.map(color => ({
                id: color.idName,
                label: color.names.length ? color.names[0].text : color.idName,
            })),
            setValue: newValue => update('color', {value: newValue}),
        },
        shape: {
            id: 'shape',
            name: 'Shape',
            active: filters.shape.active,

            value: filters.shape.value,
            options: data.shapes.map(shape => ({
                id: shape.idName,
                label: shape.names.length ? shape.names[0].text : shape.idName,
            })),
            setValue: newValue => update('shape', {value: newValue}),
        },
        type: {
            id: 'type',
            name: 'Type',
            active: filters.type.active,

            value: filters.type.value,
            options: data.types.edges.map(({node}) => ({
                id: node.idName,
                label: node.names.length ? node.names[0].text : node.idName,
            })),
            setValue: newValue => update('type', {...filters.type, value: newValue}),

            method: filters.type.method,
            setMethod: newMethod => update('type', {...filters.type, method: newMethod}),
        },
        generation: {
            id: 'generation',
            name: 'Generation',
            active: filters.generation.active,

            value: filters.generation.value,
            options: data.generations.edges.map(({node}) => ({
                id: node.idName,
                label: node.names.length ? node.names[0].text : node.idName,
                description: node.versionGroups
                    .map(versionGroup =>
                        versionGroup.versions
                            .map(ver =>
                                ver.names.length ? ver.names[0].text : ver.idName
                            )
                            .join('/')
                    )
                    .join(', '),
            })),
            setValue: newValue => update('generation', {value: newValue}),
        },
        species: {
            id: 'species',
            name: 'Species Name',
            active: filters.species.active,

            value: filters.species.value,
            setValue: newValue =>
                update('species', {...filters.species, value: newValue}),

            method: filters.species.method,
            setMethod: newMethod =>
                update('species', {...filters.species, method: newMethod}),
        },
    };

    const p = parameters;

    return (
        <SentenceFilter
            parameters={parameters}
            setActive={setActive}
            common={{languages}}
        >
            <Part text="All " />
            <Part
                // text={p.color.options[p.color.value].label}
                Input={Select}
                id="color"
                main
            />
            <Part text=" " id="shape" />
            <Part
                // text={p.shape.options[p.shape.value].label}
                Input={Select}
                id="shape"
                main
            />
            <Part text="-shaped" id="shape" />
            <Part text=" Pokémon" />
            <Part text=" that are " id="type" />
            <Part text={'d'} Input={ListMethodSelect} id="type" />
            <Part text=" type " id="type" />
            <Part
                // text={
                //     Array.isArray(p.type.value)
                //         ? p.type.value.map(t => p.type.options[t].label).join(', ')
                //         : ''
                // }
                Input={Multi}
                id="type"
                main
            />
            <Part text=" introduced in " id="generation" />
            <Part
                // text={p.generation.options[p.generation.value].label}
                Input={Select}
                id="generation"
                main
            />
            <Part text=" weighing " id="weight" />
            <Part text={'d'} Input={OperatorSelect} id="weight" />
            <Part text=" " id="weight" />
            <Part text={p.weight.value} Input={Number} id="weight" main />
            <Part text=" kg" id="weight" />
            <Part text=" whose species names " id="species" />
            <Part text={'d'} Input={SearchMethodSelect} id="species" />
            <Part text={' '} id="species" />
            <Part text={p.species.value} Input={SpeciesTextSelect} id="species" main />
            <Part text="." />
        </SentenceFilter>
    );
}
