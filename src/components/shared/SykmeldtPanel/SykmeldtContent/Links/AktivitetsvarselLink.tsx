import React, { ReactElement } from 'react'
import { EnvelopeClosedIcon, EnvelopeClosedFillIcon } from '@navikt/aksel-icons'

import LinkPanel from '../../../links/LinkPanel'
import { AktivitetsvarselFragment } from '../../../../../graphql/queries/graphql.generated'

interface Props {
    sykmeldtId: string
    aktivitetsvarsler: AktivitetsvarselFragment[]
}

const AktivitetsvarselLink = ({ sykmeldtId, aktivitetsvarsler }: Props): ReactElement | null => {
    if (aktivitetsvarsler.length === 0) return null

    const unreadItems = aktivitetsvarsler.filter((it) => !it.lest)

    if (unreadItems.length === 0) {
        return (
            <LinkPanel Icon={EnvelopeClosedIcon} href={`/sykmeldt/${sykmeldtId}/meldinger`}>
                Beskjeder
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            href={`/sykmeldt/${sykmeldtId}/meldinger`}
            Icon={EnvelopeClosedFillIcon}
            description={
                unreadItems.length === 1 ? 'Påminnelse om aktivitet' : `${unreadItems.length} påminnelser om aktivitet`
            }
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
        >
            Beskjeder
        </LinkPanel>
    )
}

export default AktivitetsvarselLink
