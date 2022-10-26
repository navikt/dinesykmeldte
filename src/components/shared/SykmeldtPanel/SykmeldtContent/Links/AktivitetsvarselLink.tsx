import React from 'react'
import { Email, EmailFilled } from '@navikt/ds-icons'

import LinkPanel from '../../../links/LinkPanel'
import { AktivitetsvarselFragment } from '../../../../../graphql/queries/graphql.generated'

interface Props {
    sykmeldtId: string
    aktivitetsvarsler: AktivitetsvarselFragment[]
}

const AktivitetsvarselLink = ({ sykmeldtId, aktivitetsvarsler }: Props): JSX.Element | null => {
    if (aktivitetsvarsler.length === 0) return null

    const unreadItems = aktivitetsvarsler.filter((it) => !it.lest)

    if (unreadItems.length === 0) {
        return (
            <LinkPanel Icon={Email} href={`/sykmeldt/${sykmeldtId}/meldinger`}>
                Beskjeder
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            href={`/sykmeldt/${sykmeldtId}/meldinger`}
            Icon={EmailFilled}
            description="Påminnelse om aktivitet"
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
