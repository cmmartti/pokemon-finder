import React, {useState} from 'react';
import {useQuery} from 'react-apollo-hooks';
import gql from 'graphql-tag';

import {SingleSelect, SearchSelect, MultiSelect} from './controls/Select';
import TextInput from './controls/TextInput';
import NumberInput from './controls/NumberInput';
import SentenceFilter, {SentencePart as Part} from './controls/SentenceFilter';
import {
    Filter as FilterType,
    State,
    Dispatch,
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

const arrayMatchOptions = [
    {id: 'all', label: 'all of'},
    {id: 'some', label: 'one of'},
    {id: 'eq', label: 'exactly'},
];
const numberMatchOptions = [
    {id: 'lt', label: 'less than'},
    {id: 'eq', label: 'equal to'},
    {id: 'gt', label: 'greater than'},
];
const stringMatchOptions = [
    {id: 'has', label: 'contain'},
    {id: 'sw', label: 'start with'},
    {id: 'eq', label: 'exactly match'},
];

type Props = {state: State; dispatch: Dispatch; filter: FilterType};

export default function Filter({filter, state, dispatch}: Props) {
    const {data, loading} = useQuery(QUERY, {
        variables: {lang: state.languages},
        suspend: false,
    });

    if (loading) {
        return <SentenceFilter status="Loading filter…" />;
    }

    function update(key, value) {
        dispatch({
            type: 'set_search_filter',
            filter: {...filter, [key]: value},
        });
    }
    function setActive(key, active) {
        dispatch({
            type: 'set_search_filter',
            filter: {...filter, [key]: {...filter[key], active}},
        });
    }

    const colors = data.colors.map(color => ({
        id: color.idName,
        label: color.names.length ? color.names[0].text : color.idName,
    }));
    const generations = data.generations.edges.map(({node}) => ({
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
    const shapes = data.shapes.map(shape => ({
        id: shape.idName,
        label: shape.names.length ? shape.names[0].text : shape.idName,
    }));
    const types = data.types.edges.map(({node}) => ({
        id: node.idName,
        label: node.names.length ? node.names[0].text : node.idName,
    }));

    const {color, generation, shape, species, type, weight} = filter;

    const renderColor = ref => (
        <SearchSelect
            ref={ref}
            onChange={v => update('color', createString(color.active, v.id))}
            options={colors}
            value={colors.find(opt => opt.id === color.value)}
        />
    );
    const renderShape = ref => (
        <SearchSelect
            ref={ref}
            onChange={val => update('shape', createString(shape.active, val.id))}
            options={shapes}
            value={shapes.find(opt => opt.id === shape.value)}
        />
    );
    const renderTypeMatch = ref => (
        <SingleSelect
            ref={ref}
            onChange={val =>
                update('type', createArrayMatch(type.active, type.value.array, val.id))
            }
            options={arrayMatchOptions}
            value={arrayMatchOptions.find(opt => opt.id === type.value.match)}
        />
    );
    const renderType = ref => (
        <MultiSelect
            ref={ref}
            onChange={newValues =>
                update(
                    'type',
                    createArrayMatch(
                        type.active,
                        newValues ? newValues.map(val => val.id) : [],
                        type.value.match
                    )
                )
            }
            options={types}
            value={type.value.array.map(id => types.find(opt => opt.id === id))}
        />
    );
    const renderGeneration = ref => (
        <SearchSelect
            ref={ref}
            onChange={val =>
                update('generation', createString(generation.active, val.id))
            }
            options={generations}
            value={generations.find(option => option.id === generation.value)}
        />
    );
    const renderWeightMatch = ref => (
        <SingleSelect
            ref={ref}
            onChange={val =>
                update(
                    'weight',
                    createNumberMatch(weight.active, weight.value.number, val.id)
                )
            }
            options={numberMatchOptions}
            value={numberMatchOptions.find(option => option.id === weight.value.match)}
        />
    );
    const renderWeight = ref => (
        <NumberInput
            ref={ref}
            onChange={val =>
                update(
                    'weight',
                    createNumberMatch(weight.active, val, weight.value.match)
                )
            }
            value={weight.value.number}
        />
    );
    const renderSpeciesMatch = ref => (
        <SingleSelect
            ref={ref}
            onChange={val =>
                update(
                    'species',
                    createStringMatch(species.active, species.value.string, val.id)
                )
            }
            options={stringMatchOptions}
            value={stringMatchOptions.find(option => option.id === species.value.match)}
        />
    );
    const renderSpecies = ref => (
        <SpeciesTextInput
            innerRef={ref}
            languages={state.languages}
            onSubmit={val =>
                update(
                    'species',
                    createStringMatch(species.active, val, species.value.match)
                )
            }
            submitOnChange={!state.autoSubmit}
            value={species.value.string}
            match={species.value.match}
        />
    );

    // Partial French translation
    if (state.languages[0] === 'fr') {
        return (
            <SentenceFilter
                setActive={setActive}
                parameters={{
                    color: {name: 'Coleur', active: color.active},
                    generation: {name: 'Génération', active: generation.active},
                    shape: {name: 'Forme', active: shape.active},
                    species: {name: "Nom d'espèce", active: species.active},
                    type: {name: 'Type', active: type.active},
                    weight: {name: 'Poids', active: weight.active},
                }}
            >
                <Part>All </Part>
                <Part id="color" main render={renderColor}>
                    {colors.find(opt => opt.id === color.value).label}
                </Part>
                <Part id="color"> </Part>
                <Part id="shape" main render={renderShape} />
                <Part id="shape">-shaped </Part>
                <Part>Pokémon</Part>
                <Part id="type"> that are </Part>
                <Part id="type" render={renderTypeMatch} />
                <Part id="type"> type </Part>
                <Part id="type" render={renderType} main />
                <Part id="generation"> that were introduced in </Part>
                <Part id="generation" render={renderGeneration} main />
                <Part id="weight"> weighing </Part>
                <Part id="weight" render={renderWeightMatch} />
                <Part id="weight"> </Part>
                <Part id="weight" render={renderWeight} main />
                <Part id="weight"> kg</Part>
                <Part id="species"> whose species names </Part>
                <Part id="species" render={renderSpeciesMatch} />
                <Part id="species"> </Part>
                <Part id="species" render={renderSpecies} main />
                <Part>.</Part>
            </SentenceFilter>
        );
    }

    // Fall back to English
    return (
        <SentenceFilter
            setActive={setActive}
            parameters={{
                color: {name: 'Colour', active: color.active},
                generation: {name: 'Generation', active: generation.active},
                shape: {name: 'Shape', active: shape.active},
                species: {name: 'Species Name', active: species.active},
                type: {name: 'Type', active: type.active},
                weight: {name: 'Weight', active: weight.active},
            }}
        >
            <Part>All </Part>
            <Part id="color" main render={renderColor}>
                {colors.find(opt => opt.id === color.value).label}
            </Part>
            <Part id="color"> </Part>
            <Part id="shape" main render={renderShape} />
            <Part id="shape">-shaped </Part>
            <Part>Pokémon</Part>
            <Part id="type"> that are </Part>
            <Part id="type" render={renderTypeMatch} />
            <Part id="type"> type </Part>
            <Part id="type" render={renderType} main />
            <Part id="generation"> that were introduced in </Part>
            <Part id="generation" render={renderGeneration} main />
            <Part id="weight"> weighing </Part>
            <Part id="weight" render={renderWeightMatch} />
            <Part id="weight"> </Part>
            <Part id="weight" render={renderWeight} main />
            <Part id="weight"> kg</Part>
            <Part id="species"> whose species names </Part>
            <Part id="species" render={renderSpeciesMatch} />
            <Part id="species"> </Part>
            <Part id="species" render={renderSpecies} main />
            <Part>.</Part>
        </SentenceFilter>
    );
}

function SpeciesTextInput({innerRef, languages, submitOnChange, onSubmit, value, match}) {
    const [typed, setTyped] = useState(value);

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
    const {data: results} = useQuery(query, {
        variables: {
            textFilter: {[match]: typed, lang: languages[0]},
            lang: languages,
        },
        suspend: false,
    });

    var suggestions = [];
    if (typed && results.pokemonSpeciess) {
        suggestions = results.pokemonSpeciess.edges.map(edge =>
            edge.node.names[0].text.toLowerCase()
        );
    }
    return (
        <TextInput
            ref={innerRef}
            onSubmit={onSubmit}
            onChange={setTyped}
            suggestions={suggestions}
            value={value || ''}
            submitOnChange={submitOnChange}
        />
    );
}
