import { Select } from '@navikt/ds-react'
import React from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../state/store'
import { logAmplitudeEvent } from '../../../amplitude/amplitude'

import { useSortBy } from './useSortBy'
import styles from './SortBy.module.css'

type SortBy = 'latest' | 'oldest' | 'name'

const SortBy = (): JSX.Element => {
    const filter = useSelector((state: RootState) => state.sortByNotifying)
    const { handleSortChange } = useSortBy()

    return (
        <div className={styles.root}>
            <Select
                className={styles.sortSelect}
                label="Sorter varslinger"
                value={filter.sortBy}
                autoComplete="off"
                onChange={(event) => {
                    handleSortChange(event.target.value)
                    logAmplitudeEvent({
                        eventName: 'søk',
                        data: { destinasjon: 'sorter varslinger etter', søkeord: event.target.value },
                    })
                }}
            >
                <option value="latest">Nyeste</option>
                <option value="oldest">Eldste</option>
                <option value="name">Navn</option>
            </Select>
        </div>
    )
}

export default SortBy
