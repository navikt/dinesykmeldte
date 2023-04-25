import { Grid, Heading } from '@navikt/ds-react'
import { useSelector } from 'react-redux'

import { cn } from '../../../utils/tw-utils'
import { RootState } from '../../../state/store'
import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated'
import useSortedSykmeldteNotifying from '../useSortedSykmeldteNotifying'

import Sykmeldte from './Sykmeldte'
import SortBy from './SortBy'
import MarkAllAsRead from './MarkAllAsRead'

interface Props {
    sykmeldte: PreviewSykmeldtFragment[]
    focusSykmeldtId: string
    nonNotifyingCount: number
}

function SykmeldteNotifying({ sykmeldte, focusSykmeldtId, nonNotifyingCount }: Props): JSX.Element | null {
    const sortByNotifying = useSelector((state: RootState) => state.sortByNotifying)
    const { sortedSykmeldteWithDateAndText } = useSortedSykmeldteNotifying(sykmeldte)
    const showDateHeading = sortByNotifying.sortBy === 'latest' || sortByNotifying.sortBy === 'oldest'

    if (sykmeldte.length === 0) return null

    return (
        <>
            <section
                aria-labelledby="sykmeldte-nye-varsler-liste"
                className={cn({
                    'mb-6 pb-6': nonNotifyingCount > 0,
                })}
            >
                <div className="flex items-end justify-between max-[530px]:mb-4 max-[530px]:block">
                    <Heading
                        id="sykmeldte-nye-varsler-liste"
                        className="max-[530px]:mt-6"
                        size="large"
                        level="2"
                        spacing
                    >
                        Varslinger
                    </Heading>
                    <div className="flex items-center justify-end max-[530px]:justify-start">
                        <SortBy />
                        <MarkAllAsRead />
                    </div>
                </div>
                <Grid>
                    {sortedSykmeldteWithDateAndText.length > 0 && (
                        <Sykmeldte
                            sykmeldte={sortedSykmeldteWithDateAndText}
                            focusSykmeldtId={focusSykmeldtId}
                            notification
                            showDateHeading={showDateHeading}
                        />
                    )}
                </Grid>
            </section>
        </>
    )
}

export default SykmeldteNotifying
