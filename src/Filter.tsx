import React, {useState} from 'react';
import {useQuery} from 'react-apollo-hooks';
import gql from 'graphql-tag';

import {SingleSelect, SearchSelect, MultiSelect} from './controls/Select';
import TextInput from './controls/TextInput';
import NumberInput from './controls/NumberInput';
import SentenceFilter, {SentencePart as Part} from './controls/SentenceFilter';
import {StateProps} from './state/StateManager';
import {
    createString,
    createNumber,
    createArray,
    createStringMatch,
    createNumberMatch,
    createArrayMatch,
} from './state/types';

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

export default function Filter({state, dispatch}: StateProps) {
    const {data} = useQuery(QUERY, {variables: {lang: state.languages}});

    const search = state.search.pending || state.search.current;
    const filter = search.filter;

    function update(key, value) {
        dispatch({
            type: 'set_search_filter',
            filter: {...filter, [key]: value},
        });
    }

    function colorSelect(innerRef) {
        const options = data.colors.map(color => ({
            id: color.idName,
            label: color.names.length ? color.names[0].text : color.idName,
        }));
        const {active, value} = filter.color;
        return (
            <SearchSelect
                onChange={val => update('color', createString(active, val.id))}
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === value)}
            />
        );
    }

    function shapeSelect(innerRef) {
        const options = data.shapes.map(shape => ({
            id: shape.idName,
            label: shape.names.length ? shape.names[0].text : shape.idName,
        }));
        const {active, value} = filter.shape;
        return (
            <SearchSelect
                onChange={val => update('shape', createString(active, val.id))}
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === value)}
            />
        );
    }

    function typeWhichSelect(innerRef) {
        const options = [
            {id: 'all', label: 'all of'},
            {id: 'some', label: 'one of'},
            {id: 'eq', label: 'exactly'},
        ];
        const {active, value} = filter.type;
        return (
            <SingleSelect
                onChange={val =>
                    update('type', createArrayMatch(active, value.array, val.id))
                }
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === value.match)}
            />
        );
    }

    function typeSelect(innerRef) {
        const options = data.types.edges.map(({node}) => ({
            id: node.idName,
            label: node.names.length ? node.names[0].text : node.idName,
        }));
        const {active, value} = filter.type;
        return (
            <MultiSelect
                ref={innerRef}
                options={options}
                onChange={newValues =>
                    update(
                        'type',
                        createArrayMatch(
                            active,
                            newValues ? newValues.map(val => val.id) : [],
                            value.match
                        )
                    )
                }
                value={value.array.map(id => options.find(opt => opt.id === id))}
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
        const {active, value} = filter.generation;
        return (
            <SearchSelect
                onChange={val => update('generation', createString(active, val.id))}
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === value)}
            />
        );
    }

    function weightWhichSelect(innerRef) {
        const options = [
            {id: 'lt', label: 'less than'},
            {id: 'eq', label: 'equal to'},
            {id: 'gt', label: 'greater than'},
        ];
        const {active, value} = filter.weight;
        return (
            <SingleSelect
                onChange={val =>
                    update('weight', createNumberMatch(active, value.number, val.id))
                }
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === value.match)}
            />
        );
    }

    function weightInput(innerRef) {
        const {active, value} = filter.weight;
        return (
            <NumberInput
                ref={innerRef}
                onChange={val =>
                    update('weight', createNumberMatch(active, val, value.match))
                }
                value={value.number}
            />
        );
    }

    function speciesWhichSelect(innerRef) {
        const options = [
            {id: 'has', label: 'contain'},
            {id: 'sw', label: 'start with'},
            {id: 'eq', label: 'exactly match'},
        ];
        const {active, value} = filter.species;
        return (
            <SingleSelect
                onChange={val =>
                    update('species', createStringMatch(active, value.string, val.id))
                }
                options={options}
                ref={innerRef}
                value={options.find(option => option.id === value.match)}
            />
        );
    }

    function SpeciesTextSelect({innerRef}) {
        const {active, value} = filter.species;
        const [typed, setTyped] = useState(value.string);

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
                textFilter: {[value.match]: typed, lang: state.languages[0]},
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
            <TextInput
                ref={innerRef}
                onSubmit={val =>
                    update('species', createStringMatch(active, val, value.match))
                }
                onChange={setTyped}
                suggestions={suggestions}
                value={value.string || ''}
            />
        );
    }

    return (
        <SentenceFilter
            setActive={(key, active) =>
                dispatch({
                    type: 'set_search_filter',
                    filter: {...filter, [key]: {...filter[key], active}},
                })
            }
            parameters={{
                color: {name: 'Colour', active: filter.color.active},
                generation: {name: 'Generation', active: filter.generation.active},
                shape: {name: 'Shape', active: filter.shape.active},
                species: {name: 'Species Name', active: filter.species.active},
                type: {name: 'Type', active: filter.type.active},
                weight: {name: 'Weight', active: filter.weight.active},
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
            <Part
                render={innerRef => <SpeciesTextSelect innerRef={innerRef} />}
                id="species"
                main
            />
            <Part text="." />
        </SentenceFilter>
    );
}
