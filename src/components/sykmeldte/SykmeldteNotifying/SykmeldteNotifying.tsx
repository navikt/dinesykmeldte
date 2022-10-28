import { Grid, Heading } from '@navikt/ds-react'
import { useSelector } from 'react-redux'
import cn from 'classnames'

import { RootState } from '../../../state/store'
import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated'
import useSortedSykmeldteNotifying from '../useSortedSykmeldteNotifying'

import Sykmeldte from './Sykmeldte'
import SortBy from './SortBy'
import styles from './SykmeldteNotifying.module.css'

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
                    [styles.notifyingSectionHasFollwingSection]: nonNotifyingCount > 0,
                })}
            >
                <div className={styles.headingAndSortBy}>
                    <Heading id="sykmeldte-nye-varsler-liste" size="small" level="2" spacing>
                        Varslinger
                    </Heading>
                    <SortBy />
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
