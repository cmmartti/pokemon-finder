import React, {useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from 'urql';

import {SingleSelect, SearchSelect, MultiSelect} from '../../Select';
import TextInput from '../../TextInput';
import NumberInput from '../../NumberInput';
import {SentenceFilter, SentencePart as Part} from './SentenceFilter';

import {Filter as FilterType, Dispatch, Value} from '../state';

const arrayMatchOptions = [
    {id: 'all', label: 'all of'},
    {id: 'some', label: 'one of'},
    {id: 'eq', label: 'exactly'},
];
const numberMatchOptions = [
    {id: 'lt', label: 'less than'},
    {id: 'eq', label: 'equal to'},
    {id: 'gt', label: 'more than'},
];
const stringMatchOptions = [
    {id: 'has', label: 'contain'},
    {id: 'sw', label: 'start with'},
    {id: 'eq', label: 'exactly match'},
];

const OPTIONS_QUERY = gql`
    query($lang: String) {
        types(first: 100) {
            edges {
                node {
                    idName
                    names(lang: [$lang]) {
                        text
                    }
                }
            }
        }
        colors: pokemonColors {
            idName
            names(lang: [$lang]) {
                text
            }
        }
        shapes: pokemonShapes {
            idName
            names(lang: [$lang]) {
                text
            }
        }
        generations(first: 100) {
            edges {
                node {
                    idName
                    names(lang: [$lang]) {
                        text
                    }
                    versionGroups {
                        versions {
                            idName
                            names(lang: [$lang]) {
                                text
                            }
                        }
                    }
                }
            }
        }
    }
`;

type Props = {
    dispatch: Dispatch;
    filter: FilterType;
    active: (keyof FilterType)[];
    language: string;
    submitOnChange: boolean;
};

export default function Filter(props: Props) {
    const {filter, dispatch, language} = props;

    const [res] = useQuery({
        query: OPTIONS_QUERY,
        variables: {lang: language},
    });

    if (res.error) {
        return <SentenceFilter status="Loading failed. " />;
    }

    if (res.fetching) {
        return null;
        // return <SentenceFilter status="Loading filter…" />;
    }

    function update(key: keyof FilterType, value: Value['value']) {
        dispatch({
            type: 'set_search_filter',
            filter: {
                ...filter,
                [key]: {
                    type: filter[key].type,
                    value,
                },
            },
        });
    }

    const {data} = res;

    const allColors = data.colors.map(color => ({
        id: color.idName,
        label: color.names.length ? color.names[0].text : color.idName,
    }));
    const renderColor = ref => (
        <SearchSelect
            ref={ref}
            onChange={v => update('color', v.id)}
            options={allColors}
            value={allColors.find(opt => opt.id === filter.color.value) || null}
        />
    );

    const allShapes = data.shapes.map(shape => ({
        id: shape.idName,
        label: shape.names.length ? shape.names[0].text : shape.idName,
    }));
    const renderShape = ref => (
        <SearchSelect
            ref={ref}
            onChange={val => update('shape', val.id)}
            options={allShapes}
            value={allShapes.find(opt => opt.id === filter.shape.value) || null}
        />
    );

    const allTypes = data.types.edges.map(({node}) => ({
        id: node.idName,
        label: node.names.length ? node.names[0].text : node.idName,
    }));
    const type = filter.type.value;
    const renderType = ref => (
        <MultiSelect
            ref={ref}
            onChange={newValues =>
                update('type', {
                    array: newValues ? newValues.map(val => val.id) : [],
                    match: type.match,
                })
            }
            options={allTypes}
            value={type.array.map(id => allTypes.find(opt => opt.id === id))}
        />
    );
    const renderTypeMatch = ref => (
        <SingleSelect
            ref={ref}
            onChange={val =>
                update('type', {
                    array: type.array,
                    match: val.id,
                })
            }
            options={arrayMatchOptions}
            value={arrayMatchOptions.find(opt => opt.id === type.match)}
        />
    );

    const allGenerations = data.generations.edges.map(({node}) => ({
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
    const generation = filter.generation.value;
    const renderGeneration = ref => (
        <SearchSelect
            ref={ref}
            onChange={val => update('generation', val.id)}
            options={allGenerations}
            value={allGenerations.find(option => option.id === generation) || null}
        />
    );

    const weight = filter.weight.value;
    const renderWeight = ref => (
        <NumberInput
            ref={ref}
            onChange={val =>
                update('weight', {
                    number: val,
                    match: weight.match,
                })
            }
            value={weight.number || 0}
        />
    );
    const renderWeightMatch = ref => (
        <SingleSelect
            ref={ref}
            onChange={val =>
                update('weight', {
                    number: weight.number,
                    match: val.id,
                })
            }
            options={numberMatchOptions}
            value={numberMatchOptions.find(option => option.id === weight.match)}
        />
    );

    const species = filter.species.value;
    const renderSpecies = ref => (
        <SpeciesTextInput
            innerRef={ref}
            language={language}
            onSubmit={val =>
                update('species', {
                    string: val,
                    match: species.match,
                })
            }
            submitOnChange={props.submitOnChange}
            value={species.string}
            match={species.match}
        />
    );
    const renderSpeciesMatch = ref => (
        <SingleSelect
            ref={ref}
            onChange={val =>
                update('species', {
                    string: species.string,
                    match: val.id,
                })
            }
            options={stringMatchOptions}
            value={stringMatchOptions.find(option => option.id === species.match)}
        />
    );

    function setActive(key, isActive: boolean) {
        let active = props.active;
        if (isActive) {
            active = [...active, key];
        } else {
            const index = props.active.indexOf(key);
            active = [
                ...active.slice(0, index),
                ...active.slice(index + 1, active.length),
            ];
        }
        dispatch({type: 'set_search_filter_active', active});
    }

    return (
        <SentenceFilter
            setActive={setActive}
            active={props.active}
            parameters={{
                color: 'Colour',
                generation: 'Generation',
                shape: 'Shape',
                species: 'Species Name',
                type: 'Type',
                weight: 'Weight',
            }}
        >
            <Part>All </Part>
            <Part id="color" main render={renderColor} />
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

function SpeciesTextInput({innerRef, language, submitOnChange, onSubmit, value, match}) {
    const [typed, setTyped] = useState(value);

    const query = gql`
        query($lang: String, $textFilter: TextFilter!) {
            pokemonSpeciess(first: 10, where: {name: $textFilter}) {
                edges {
                    node {
                        names(lang: [$lang]) {
                            text
                        }
                    }
                }
            }
        }
    `;

    const [res] = useQuery({
        query,
        variables: {
            textFilter: {[match]: typed, lang: language},
            lang: language,
        },
    });

    var suggestions = [];
    if (typed && !res.fetching && res.data.pokemonSpeciess) {
        suggestions = res.data.pokemonSpeciess.edges.map(edge =>
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
