import React from 'react';

import SortableInput from './SortableInput';
import allFields from '../fields';
import styles from './SearchSettings.module.scss';
import {Search} from '../state';

type Props = {
    fields: Search['fields'];
    setFields: (fields: Search['fields']) => void;
};

export default function Field({fields, setFields}: Props) {
    return (
        <SortableInput
            options={allFields}
            value={fields.map(id => allFields.find(field => field.id === id))}
            onChange={fields => setFields(fields.map(field => field.id))}
            themeClassName={styles['field-theme']}
        />
    );
}
