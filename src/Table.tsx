import React from 'react';

import styles from './SearchResults.module.scss';

export type Column = {
    id: string;
    header: string;
    accessor: string | ((row: any) => any);
    render?: (field: any, row: any) => any;
    className?: string;
};

type Props = {data: any[]; columns: Column[]; noResultsMessage?: any};

export default function Table({data, columns, noResultsMessage = 'No results'}: Props) {
    return (
        <div className={styles['scroll-wrapper']}>
            <table>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.id} className={col.className}>
                                {col.header}
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

                                    // if (typeof render === 'function') {
                                    //     return (
                                    //         <React.Fragment key={id}>
                                    //             {render(field, row)}
                                    //         </React.Fragment>
                                    //     );
                                    // }

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
