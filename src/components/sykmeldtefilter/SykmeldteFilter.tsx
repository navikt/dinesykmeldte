import { Cell, Grid, Select, TextField } from '@navikt/ds-react'
import React from 'react'
import { useSelector } from 'react-redux'

import { logAmplitudeEvent } from '../../amplitude/amplitude'
import { RootState } from '../../state/store'

import { useIsMoreThan5SykmeldteInSelectedVirksomhet } from './useIsMoreThan5SykmeldteInSelectedVirksomhet'
import { useFilterChangeHandlers } from './useFilterChangeHandlers'

const SykmeldteFilter = (): JSX.Element | null => {
    const hasMoreThan5InOrg = useIsMoreThan5SykmeldteInSelectedVirksomhet()
    const filter = useSelector((state: RootState) => state.filter)
    const { handleNameFilterChange, handleShowChange, handleSortChange } = useFilterChangeHandlers()

    if (!hasMoreThan5InOrg) return null

    return (
        <section className="my-6" aria-label="Filtrer og sorter sykmeldte">
            <Grid>
                <Cell xs={12} md={4} className="flex">
                    <TextField
                        hideLabel
                        label=""
                        className="max-w-224 flex-auto self-end max-[720px]:max-w-unset"
                        placeholder="Søk på navn"
                        aria-label="Søk på navn"
                        value={filter.name ?? ''}
                        onChange={(event) => handleNameFilterChange(event.target.value)}
                        autoComplete="off"
                    />
                </Cell>
                <Cell xs={6} md={5}>
                    <Select
                        className="flex-auto"
                        label="Vis"
                        value={filter.show}
                        onChange={(event) => {
                            handleShowChange(event.target.value)
                            logAmplitudeEvent({
                                eventName: 'søk',
                                data: { destinasjon: 'vis', søkeord: event.target.value },
                            })
                        }}
                        autoComplete="off"
                    >
                        <option value="all">Alle</option>
                        <option value="sykmeldte">Sykmeldte</option>
                        <option value="sykmeldte-per-virksomhet">Sykmeldte per virksomhet</option>
                        <option value="friskmeldte">Tidligere sykmeldte</option>
                        <option value="graderte">Graderte</option>
                    </Select>
                </Cell>
                <Cell xs={6} md={3}>
                    <Select
                        className="flex-auto"
                        label="Sorter etter"
                        value={filter.sortBy}
                        onChange={(event) => {
                            handleSortChange(event.target.value)
                            logAmplitudeEvent({
                                eventName: 'søk',
                                data: { destinasjon: 'sorter etter', søkeord: event.target.value },
                            })
                        }}
                        autoComplete="off"
                    >
                        <option value="date">Dato</option>
                        <option value="name">Navn</option>
                    </Select>
                </Cell>
            </Grid>
        </section>
    )
}

export default SykmeldteFilter
