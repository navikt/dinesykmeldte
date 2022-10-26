import React from 'react'
import { Cell, Grid } from '@navikt/ds-react'
import { Bandage } from '@navikt/ds-icons'

import { PreviewSykmeldtFragment, SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import LinkPanel from '../shared/links/LinkPanel'
import { formatDateRange } from '../../utils/dateUtils'
import { partition } from '../../utils/tsUtils'
import { formatNameSubjective } from '../../utils/sykmeldtUtils'
import { getSykmeldingPeriodDescription, getEarliestFom, getLatestTom } from '../../utils/sykmeldingPeriodUtils'
import ListSection, { SectionListRoot } from '../shared/ListSection/ListSection'
import { sykmeldingByDateDesc } from '../../utils/sykmeldingUtils'

interface Props {
    sykmeldtId: string
    sykmeldt: PreviewSykmeldtFragment
}

function SykmeldingerList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const [readSykmeldinger, unreadSykmeldinger] = partition((it) => it.lest, sykmeldt.sykmeldinger)

    const hasUnread = unreadSykmeldinger.length > 0
    const hasRead = readSykmeldinger.length > 0

    return (
        <SectionListRoot>
            {!hasRead && !hasUnread && <div>Vi fant ingen sykmeldinger for {formatNameSubjective(sykmeldt.navn)}.</div>}
            {hasUnread && (
                <ListSection id="sykmeldinger-list-uleste-header" title="Uleste">
                    <Grid>
                        {unreadSykmeldinger.sort(sykmeldingByDateDesc).map((it) => {
                            const earliestFom = getEarliestFom(it)
                            const latestTom = getLatestTom(it)
                            return (
                                <Cell key={it.id} xs={12}>
                                    <LinkPanel
                                        href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                        Icon={Bandage}
                                        detail={formatDateRange(earliestFom, latestTom)}
                                        description={<SykmeldingDescription sykmelding={it} />}
                                        notify
                                    >
                                        Sykmelding
                                    </LinkPanel>
                                </Cell>
                            )
                        })}
                    </Grid>
                </ListSection>
            )}
            {hasRead && (
                <ListSection id="sykmeldinger-list-leste-header" title="Leste">
                    <Grid>
                        {readSykmeldinger.sort(sykmeldingByDateDesc).map((it) => {
                            const earliestFom = getEarliestFom(it)
                            const latestTom = getLatestTom(it)
                            return (
                                <Cell key={it.id} xs={12}>
                                    <LinkPanel
                                        href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                        Icon={Bandage}
                                        detail={formatDateRange(earliestFom, latestTom)}
                                        description={<SykmeldingDescription sykmelding={it} />}
                                    >
                                        Sykmelding
                                    </LinkPanel>
                                </Cell>
                            )
                        })}
                    </Grid>
                </ListSection>
            )}
        </SectionListRoot>
    )
}

function SykmeldingDescription({ sykmelding }: { sykmelding: SykmeldingFragment }): JSX.Element {
    return <div>{sykmelding.perioder.map((it) => getSykmeldingPeriodDescription(it)).join(', ')}</div>
}

export default SykmeldingerList
