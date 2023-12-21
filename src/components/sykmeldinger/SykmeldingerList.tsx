import React, { ReactElement } from 'react'
import { HGrid } from '@navikt/ds-react'
import { BandageIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'
import { partition } from 'remeda'

import { PreviewSykmeldtFragment, SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import LinkPanel from '../shared/links/LinkPanel'
import { formatDateRange } from '../../utils/dateUtils'
import { formatNameSubjective } from '../../utils/sykmeldtUtils'
import { getSykmeldingPeriodDescription, getEarliestFom, getLatestTom } from '../../utils/sykmeldingPeriodUtils'
import ListSection, { SectionListRoot } from '../shared/ListSection/ListSection'
import { sykmeldingByDateDesc } from '../../utils/sykmeldingUtils'
import { useLogAmplitudeEvent } from '../../amplitude/amplitude'
import { isUtenlandsk } from '../../utils/utenlanskUtils'

const DialogmoteSykmeldingerInfoPanel = dynamic(
    () => import('../DialogmoteInfoPanel/DialogmoteSykmeldingerInfoPanel'),
    { ssr: false },
)

interface Props {
    sykmeldtId: string
    sykmeldt: PreviewSykmeldtFragment
}

function SykmeldingerList({ sykmeldtId, sykmeldt }: Props): ReactElement {
    const [readSykmeldinger, unreadSykmeldinger] = partition(sykmeldt.sykmeldinger, (it) => it.lest)

    const hasUnread = unreadSykmeldinger.length > 0
    const hasRead = readSykmeldinger.length > 0

    useLogAmplitudeEvent(
        { eventName: 'komponent vist', data: { komponent: 'SykmeldingerList' } },
        { ulesteSykmeldinger: unreadSykmeldinger.length },
    )

    return (
        <SectionListRoot>
            {!hasRead && !hasUnread && <div>Vi fant ingen sykmeldinger for {formatNameSubjective(sykmeldt.navn)}.</div>}
            {hasUnread && (
                <ListSection id="sykmeldinger-list-uleste-header" title="Uleste">
                    <HGrid gap="6">
                        {unreadSykmeldinger.sort(sykmeldingByDateDesc).map((it) => {
                            const earliestFom = getEarliestFom(it)
                            const latestTom = getLatestTom(it)
                            return (
                                <div key={it.id}>
                                    <LinkPanel
                                        href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                        Icon={BandageIcon}
                                        detail={formatDateRange(earliestFom, latestTom)}
                                        description={<SykmeldingDescription sykmelding={it} />}
                                        notify
                                    >
                                        {isUtenlandsk(it) ? 'Utenlandsk sykmelding' : 'Sykmelding'}
                                    </LinkPanel>
                                </div>
                            )
                        })}
                    </HGrid>
                </ListSection>
            )}
            {(hasRead || hasUnread) && <DialogmoteSykmeldingerInfoPanel sykmeldtId={sykmeldtId} name={sykmeldt.navn} />}
            {hasRead && (
                <ListSection id="sykmeldinger-list-leste-header" title="Leste">
                    <HGrid gap="6">
                        {readSykmeldinger.sort(sykmeldingByDateDesc).map((it) => {
                            const earliestFom = getEarliestFom(it)
                            const latestTom = getLatestTom(it)
                            return (
                                <div key={it.id}>
                                    <LinkPanel
                                        href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                        Icon={BandageIcon}
                                        detail={formatDateRange(earliestFom, latestTom)}
                                        description={<SykmeldingDescription sykmelding={it} />}
                                    >
                                        {isUtenlandsk(it) ? 'Utenlandsk sykmelding' : 'Sykmelding'}
                                    </LinkPanel>
                                </div>
                            )
                        })}
                    </HGrid>
                </ListSection>
            )}
        </SectionListRoot>
    )
}

function SykmeldingDescription({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    return <div>{sykmelding.perioder.map((it) => getSykmeldingPeriodDescription(it)).join(', ')}</div>
}

export default SykmeldingerList
