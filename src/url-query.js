import {
    pushUrlQuery,
    pushInUrlQuery,
    replaceInUrlQuery,
    decode,
    encode,
} from 'react-url-query';

function mapUrlToProps(url) {
    function sortFromString(sorts) {
        return sorts.map(sortString => {
            if (sortString[0] === '-') {
                return {id: sortString.substring(1), direction: 'DESC'};
            }
            return {id: sortString, direction: 'ASC'};
        });
    }

    const active = decode('array', url.active, []);

    return {
        rawQuery: url,
        filters: {
            type: {
                value: decode('array', url.type),
                active: active.includes('type'),
                method: url.type_method || 'all',
            },
            color: {
                value: url.color,
                active: active.includes('color'),
            },
            shape: {
                value: url.shape,
                active: active.includes('shape'),
            },
            generation: {
                value: url.generation,
                active: active.includes('generation'),
            },
            species: {
                value: url.species,
                active: active.includes('species'),
                method: url.species_method || 'sw',
            },
            weight: {
                value: url.weight,
                active: active.includes('weight'),
                operator: url.weight_operator || 'eq',
            },
        },
        sort: sortFromString(decode('array', url.sort, ['order'])),
        fields: decode('array', url.fields, ['index', 'sprite', 'species']),
        languages: decode('array', url.lang, ['en']),
    };
}

function mapUrlChangeHandlersToProps({rawQuery}) {
    function setFilter(filterName, data) {
        const newQuery = {
            ...rawQuery,
            [filterName]: Array.isArray(data.value)
                ? encode('array', data.value)
                : data.value,
        };

        for (let [key, value] of Object.entries(data)) {
            if ((key !== 'active') & (key !== 'value')) {
                newQuery[`${filterName}_${key}`] = value;
            }
        }
        pushUrlQuery(newQuery);
    }

    function setActive(filter, isActive = true) {
        const active = new Set(decode('array', rawQuery.active, []));
        if (isActive) {
            active.add(filter);
        } else active.delete(filter);
        pushInUrlQuery('active', encode('array', Array.from(active.values()).sort()));
    }

    function sortToString(sort) {
        return sort.map(s => (s.direction === 'DESC' ? '-' : '') + s.id);
    }

    return {
        setFilter,
        setActive,
        setSort: newSort =>
            replaceInUrlQuery('sort', encode('array', sortToString(newSort))),
        setFields: newFields =>
            replaceInUrlQuery('fields', encode('array', newFields.map(f => f.id))),
        setLanguages: newLanguages =>
            replaceInUrlQuery('lang', encode('array', newLanguages)),
    };
}

export {mapUrlToProps, mapUrlChangeHandlersToProps};
