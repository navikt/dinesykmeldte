import { Select, TextField } from '@navikt/ds-react';
import React, { useCallback } from 'react';

import { useApplicationContext } from '../shared/StateProvider';

import styles from './SykmeldteFilter.module.css';

const SykmeldteFilter = (): JSX.Element => {
    const [state, dispatch] = useApplicationContext();
    const handleNameFilterChange = useCallback(
        (name: string) => dispatch({ type: 'filterName', payload: name }),
        [dispatch],
    );
    const handleShowChange = useCallback(
        (show: string) => {
            if (show !== 'all' && show !== 'sykmeldte' && show !== 'friskmeldte')
                throw Error(`Invalid show value (${show ?? '[Missing]'})`);

            dispatch({ type: 'showFilter', payload: show });
        },
        [dispatch],
    );
    const handleSortChange = useCallback(
        (sortBy: string) => {
            if (sortBy !== 'date' && sortBy !== 'name') throw Error('Invalid sort by value value');

            dispatch({ type: 'sortBy', payload: sortBy });
        },
        [dispatch],
    );

    return (
        <div className={styles.root}>
            <TextField
                hideLabel
                label=""
                className={styles.filterInput}
                placeholder="Søk på navn"
                value={state.filter.name ?? undefined}
                onChange={(event) => handleNameFilterChange(event.target.value)}
            />
            <div className={styles.selectSection}>
                <Select
                    className={styles.visSelect}
                    label="Vis"
                    value={state.filter.show}
                    onChange={(event) => handleShowChange(event.target.value)}
                >
                    <option value="all">Alle</option>
                    <option value="sykmeldte">Sykmeldte</option>
                    <option value="friskmeldte">Friskmeldte</option>
                </Select>
                <Select
                    className={styles.sortSelect}
                    label="Sorter etter"
                    value={state.filter.sortBy}
                    onChange={(event) => handleSortChange(event.target.value)}
                >
                    <option value="date">Dato</option>
                    <option value="name">Navn</option>
                </Select>
            </div>
        </div>
    );
};

export default SykmeldteFilter;
