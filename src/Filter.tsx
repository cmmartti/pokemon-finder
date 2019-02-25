import React, {useState} from 'react';
import {useQuery} from 'react-apollo-hooks';
import gql from 'graphql-tag';

import {SingleSelect, SearchSelect, MultiSelect} from './controls/Select';
import TextPicker from './controls/TextPicker';
import NumberInput from './controls/NumberInput';
import SentenceFilter, {SentencePart as Part} from './controls/SentenceFilter';
import {NumberMatchValue, StringMatchValue, ListMatchValue} from './State';

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

export default function Filter({state, dispatch}) {
    const {data} = useQuery(QUERY, {variables: {lang: state.languages}});

    const search = state.search.pending || state.search.current;
    const values = search.filterValues;

    function update(id, value) {
        dispatch({
            type: 'set_search_filter_values',
            filterValues: {...values, [id]: value},
        });
    }

    function colorSelect(innerRef) {
        const options = data.colors.map(color => ({
            id: color.idName,
            label: color.names.length ? color.names[0].text : color.idName,
        }));
        return (
            <SearchSelect
                onChange={val => update('color', val.id)}
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === values.color)}
            />
        );
    }

    function shapeSelect(innerRef) {
        const options = data.shapes.map(shape => ({
            id: shape.idName,
            label: shape.names.length ? shape.names[0].text : shape.idName,
        }));
        return (
            <SearchSelect
                onChange={val => update('shape', val.id)}
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === values.shape)}
            />
        );
    }

    function typeWhichSelect(innerRef) {
        const options = [
            {id: 'all', label: 'all of'},
            {id: 'some', label: 'one of'},
            {id: 'eq', label: 'exactly'},
        ];
        return (
            <SingleSelect
                onChange={val =>
                    update('type', new ListMatchValue(values.type.list, val.id))
                }
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === values.type.match)}
            />
        );
    }

    function typeSelect(innerRef) {
        const options = data.types.edges.map(({node}) => ({
            id: node.idName,
            label: node.names.length ? node.names[0].text : node.idName,
        }));
        return (
            <MultiSelect
                ref={innerRef}
                options={options}
                onChange={newValues =>
                    update(
                        'type',
                        new ListMatchValue(
                            newValues ? newValues.map(val => val.id) : [],
                            values.type.match
                        )
                    )
                }
                value={values.type.list.map(id => options.find(opt => opt.id === id))}
            />
        );
    }

    function generationSelect(innerRef) {
        const options = data.generations.edges.map(({node}) => ({
            id: node.idName,
            label: node.names.length ? node.names[0].text : node.idName,
            description: node.versionGroups
                .map(versionGroup =>
                    versionGroup.versions
                        .map(ver => (ver.names.length ? ver.names[0].text : ver.idName))
                        .join('/')
                )
                .join(', '),
        }));
        return (
            <SearchSelect
                onChange={newValue => update('generation', newValue.id)}
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === values.generation)}
            />
        );
    }

    function weightWhichSelect(innerRef) {
        const options = [
            {id: 'lt', label: 'less than'},
            {id: 'eq', label: 'equal to'},
            {id: 'gt', label: 'greater than'},
        ];
        return (
            <SingleSelect
                onChange={newValue =>
                    update(
                        'weight',
                        new NumberMatchValue(values.weight.number, newValue.id)
                    )
                }
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === values.weight.match)}
            />
        );
    }

    function weightInput(innerRef) {
        return (
            <NumberInput
                value={values.weight.number}
                ref={innerRef}
                onChange={newValue =>
                    update('weight', new NumberMatchValue(newValue, values.weight.match))
                }
            />
        );
    }

    function speciesWhichSelect(innerRef) {
        const options = [
            {id: 'has', label: 'contain'},
            {id: 'sw', label: 'start with'},
            {id: 'eq', label: 'exactly match'},
        ];
        return (
            <SingleSelect
                onChange={newValue =>
                    update(
                        'species',
                        new StringMatchValue(values.species.string, newValue.id)
                    )
                }
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === values.species.match)}
            />
        );
    }

    function speciesTextSelect(innerRef) {
        const [typed, setTyped] = useState(values.species.string);

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
                textFilter: {
                    [values.species.match]: typed,
                    lang: state.languages[0],
                },
                lang: state.languages,
            },
            suspend: false,
        });

        var suggestions = [];
        if (typed && data.pokemonSpeciess) {
            suggestions = data.pokemonSpeciess.edges.map(edge =>
                edge.node.names[0].text.toLowerCase()
            );
        }
        return (
            <TextPicker
                ref={innerRef}
                onSubmit={newValue =>
                    update(
                        'species',
                        new StringMatchValue(newValue, values.species.match)
                    )
                }
                onChange={setTyped}
                suggestions={suggestions}
                value={values.species.string}
            />
        );
    }

    return (
        <SentenceFilter
            setActive={(id, active) =>
                dispatch({
                    type: 'set_search_filter',
                    filter: {...search.filter, [id]: active},
                })
            }
            parameters={{
                color: {name: 'Colour', active: search.filter.color},
                generation: {name: 'Generation', active: search.filter.generation},
                shape: {name: 'Shape', active: search.filter.shape},
                species: {name: 'Species Name', active: search.filter.species},
                type: {name: 'Type', active: search.filter.type},
                weight: {name: 'Weight', active: search.filter.weight},
            }}
        >
            <Part text="All " />
            <Part render={colorSelect} id="color" main />
            <Part text=" " id="shape" />
            <Part render={shapeSelect} id="shape" main />
            <Part text="-shaped" id="shape" />
            <Part text=" Pokémon" />
            <Part text=" that are " id="type" />
            <Part render={typeWhichSelect} id="type" />
            <Part text=" type " id="type" />
            <Part render={typeSelect} id="type" main />
            <Part text=" that were introduced in " id="generation" />
            <Part render={generationSelect} id="generation" main />
            <Part text=" weighing " id="weight" />
            <Part render={weightWhichSelect} id="weight" />
            <Part text=" " id="weight" />
            <Part render={weightInput} id="weight" main />
            <Part text=" kg" id="weight" />
            <Part text=" whose species names " id="species" />
            <Part render={speciesWhichSelect} id="species" />
            <Part text={' '} id="species" />
            <Part render={speciesTextSelect} id="species" main />
            <Part text="." />
        </SentenceFilter>
    );
}
