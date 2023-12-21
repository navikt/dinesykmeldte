import React, { ReactElement } from 'react'
import { HGrid } from '@navikt/ds-react'
import { EnvelopeClosedIcon } from '@navikt/aksel-icons'

import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated'
import LinkPanel from '../shared/links/LinkPanel'
import ListSection, { SectionListRoot } from '../shared/ListSection/ListSection'
import { formatDateTime } from '../../utils/dateUtils'
import { useLogAmplitudeEvent } from '../../amplitude/amplitude'

interface Props {
    sykmeldtId: string
    sykmeldt: PreviewSykmeldtFragment
}

const MeldingerList = ({ sykmeldtId, sykmeldt }: Props): ReactElement => {
    useLogAmplitudeEvent(
        { eventName: 'komponent vist', data: { komponent: 'MeldingerList' } },
        { ulesteAktivitetsvarsler: sykmeldt.aktivitetsvarsler },
    )

    return (
        <SectionListRoot>
            <ListSection id="aktivitetsvarsler-header-list" title="Aktivitetsvarsler">
                <HGrid gap="6">
                    {sykmeldt.aktivitetsvarsler.map((it) => (
                        <div key={it.hendelseId}>
                            <LinkPanel
                                href={`/sykmeldt/${sykmeldtId}/melding/${it.hendelseId}`}
                                Icon={EnvelopeClosedIcon}
                                notify={!it.lest}
                                detail={`Mottatt ${formatDateTime(it.mottatt)}`}
                                description={it.lest ? `Lest ${formatDateTime(it.lest)}` : undefined}
                            >
                                Påminnelse om aktivitet
                            </LinkPanel>
                        </div>
                    ))}
                </HGrid>
            </ListSection>
        </SectionListRoot>
    )
}

export default MeldingerList
