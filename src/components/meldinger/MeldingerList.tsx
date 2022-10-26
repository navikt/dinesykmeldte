import React from 'react'
import { Cell, Grid } from '@navikt/ds-react'
import { Email } from '@navikt/ds-icons'

import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated'
import LinkPanel from '../shared/links/LinkPanel'
import ListSection, { SectionListRoot } from '../shared/ListSection/ListSection'
import { formatDateTime } from '../../utils/dateUtils'

interface Props {
    sykmeldtId: string
    sykmeldt: PreviewSykmeldtFragment
}

const MeldingerList = ({ sykmeldtId, sykmeldt }: Props): JSX.Element => {
    return (
        <SectionListRoot>
            <ListSection id={`aktivitetsvarsler-header-list`} title="Aktivitetsvarsler">
                <Grid>
                    {sykmeldt.aktivitetsvarsler.map((it) => (
                        <Cell key={it.hendelseId} xs={12}>
                            <LinkPanel
                                href={`/sykmeldt/${sykmeldtId}/melding/${it.hendelseId}`}
                                Icon={Email}
                                notify={!it.lest}
                                detail={`Mottatt ${formatDateTime(it.mottatt)}`}
                                description={it.lest ? `Lest ${formatDateTime(it.lest)}` : undefined}
                            >
                                Påminnelse om aktivitet
                            </LinkPanel>
                        </Cell>
                    ))}
                </Grid>
            </ListSection>
        </SectionListRoot>
    )
}

export default MeldingerList
