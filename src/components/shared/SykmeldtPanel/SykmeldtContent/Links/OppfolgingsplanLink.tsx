import React, { ReactElement } from 'react'
import { TasklistIcon, TasklistFillIcon } from '@navikt/aksel-icons'

import LinkPanel from '../../../links/LinkPanel'
import { OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated'
import { getOppfolgingsplanUrl } from '../../../../../utils/hendelseUtils'

import LinkMessageList from './LinkMessageList'

interface Props {
    sykmeldtId: string
    oppfolgingsplaner: OppfolgingsplanFragment[]
}

const OppfolgingsplanLink = ({ sykmeldtId, oppfolgingsplaner }: Props): ReactElement => {
    const oppfolgingsplanUrl = getOppfolgingsplanUrl(sykmeldtId)

    if (!oppfolgingsplaner.length) {
        return (
            <LinkPanel Icon={TasklistIcon} href={oppfolgingsplanUrl}>
                Oppfølgingsplaner
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            Icon={TasklistFillIcon}
            href={oppfolgingsplanUrl}
            hendelseIds={oppfolgingsplaner.map((it) => it.hendelseId)}
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
