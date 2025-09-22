import React, { ReactElement } from 'react'
import { TasklistIcon, TasklistFillIcon } from '@navikt/aksel-icons'

import LinkPanel from '../../../links/LinkPanel'
import { OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated'

import LinkMessageList from './LinkMessageList'

interface Props {
    sykmeldtId: string
    oppfolgingsplaner: OppfolgingsplanFragment[]
    isPilotUser: boolean
}

const OppfolgingsplanLink = ({ sykmeldtId, oppfolgingsplaner, isPilotUser }: Props): ReactElement => {
    const baseUrl = isPilotUser ? `/pilot-oppfolgingsplaner/${sykmeldtId}` : `/oppfolgingsplaner/${sykmeldtId}`

    if (!oppfolgingsplaner.length) {
        return (
            <LinkPanel Icon={TasklistIcon} external="proxy" href={baseUrl}>
                Oppfølgingsplaner
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            Icon={TasklistFillIcon}
            external="proxy"
            href={`${baseUrl}?hendelser=${oppfolgingsplaner.map((it) => it.hendelseId).join('&hendelser=')}`}
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
            description={<LinkMessageList items={oppfolgingsplaner} />}
        >
            Oppfølgingsplaner
        </LinkPanel>
    )
}

export default OppfolgingsplanLink
