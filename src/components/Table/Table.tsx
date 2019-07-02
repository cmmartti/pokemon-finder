import React from 'react';

import styles from './Table.module.scss';

export type Column = {
    id: string;
    name: string;
    accessor: string | ((row: any) => any);
    render?: (field: any, row: any) => any;
    className?: string;
};

type Props = {data: any[]; columns: Column[]; noResultsMessage?: any};

export function Table({data, columns, noResultsMessage = 'No results'}: Props) {
    return (
        <div className={styles['scroll-wrapper']}>
            <table>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.id} className={col.className}>
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map(row => (
                            <tr key={row.index}>
                                {columns.map(({accessor, id, render, className}) => {
                                    let field;
                                    if (typeof accessor === 'string') {
                                        field = row[accessor];
                                    } else if (typeof accessor === 'function') {
                                        field = accessor(row);
                                    }

                                    return (
                                        <td key={id} className={className}>
                                            {render ? render(field, row) : field}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length}>{noResultsMessage}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
