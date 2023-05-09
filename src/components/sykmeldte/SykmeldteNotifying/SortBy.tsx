import { Select } from '@navikt/ds-react'
import React from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../state/store'
import { logAmplitudeEvent } from '../../../amplitude/amplitude'

import { useSortBy } from './useSortBy'

type SortBy = 'latest' | 'oldest' | 'name'

const SortBy = (): JSX.Element => {
    const filter = useSelector((state: RootState) => state.sortByNotifying)
    const { handleSortChange } = useSortBy()

    return (
        <div className="mb-3 mt-6 flex">
            <Select
                className="flex-auto justify-end [&>div:first-of-type]:w-40"
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
