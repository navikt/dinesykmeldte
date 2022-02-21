import { Cell, Grid, Select, TextField } from '@navikt/ds-react';
import React from 'react';

import { useApplicationContext } from '../shared/StateProvider';
import VirksomhetPicker from '../virksomhetpicker/VirksomhetPicker';

import { useIsMoreThan5SykmeldteInSelectedVirksomhet } from './useIsMoreThan5SykmeldteInSelectedVirksomhet';
import { useFilterChangeHandlers } from './useFilterChangeHandlers';
import styles from './SykmeldteFilter.module.css';

const SykmeldteFilter = (): JSX.Element => {
    const hasMoreThan5InOrg = useIsMoreThan5SykmeldteInSelectedVirksomhet();

    const [state] = useApplicationContext();
    const { handleNameFilterChange, handleShowChange, handleSortChange } = useFilterChangeHandlers();

    if (!hasMoreThan5InOrg)
        return (
            <Grid>
                <Cell xs={12} className={styles.virksomhetsPicker}>
                    <VirksomhetPicker />
                </Cell>
            </Grid>
        );

    return (
        <div className={styles.root}>
            <Grid>
                <Cell xs={12} className={styles.virksomhetsPicker}>
                    <VirksomhetPicker />
                </Cell>
                <Cell xs={12} md={6} className={styles.filterInputCell}>
                    <TextField
                        hideLabel
                        label=""
                        className={styles.filterInput}
                        placeholder="Søk på navn"
                        aria-label="Søk på navn"
                        value={state.filter.name ?? ''}
                        onChange={(event) => handleNameFilterChange(event.target.value)}
                    />
                </Cell>
                <Cell xs={6} md={3}>
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
                </Cell>
                <Cell xs={6} md={3}>
                    <Select
                        className={styles.sortSelect}
                        label="Sorter etter"
                        value={state.filter.sortBy}
                        onChange={(event) => handleSortChange(event.target.value)}
                    >
                        <option value="date">Dato</option>
                        <option value="name">Navn</option>
                    </Select>
                </Cell>
            </Grid>
        </div>
    );
};

export default SykmeldteFilter;
