import React, { ReactElement } from 'react'
import { Chat2Icon, Chat2FillIcon } from '@navikt/aksel-icons'

import { DialogmoteFragment } from '../../../../../graphql/queries/graphql.generated'
import LinkPanel from '../../../links/LinkPanel'

import LinkMessageList from './LinkMessageList'

interface Props {
    sykmeldtId: string
    dialogmoter: DialogmoteFragment[]
}

const DialogmoteLink = ({ sykmeldtId, dialogmoter }: Props): ReactElement => {
    if (!dialogmoter.length) {
        return (
            <LinkPanel Icon={Chat2Icon} external="proxy" href={`/dialogmoter/${sykmeldtId}`}>
                Dialogmøter
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            Icon={Chat2FillIcon}
            external="proxy"
            href={`/dialogmoter/${sykmeldtId}?hendelser=${dialogmoter.map((it) => it.hendelseId).join('&hendelser=')}`}
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
            description={<LinkMessageList items={dialogmoter} />}
        >
            Dialogmøter
        </LinkPanel>
    )
}

export default DialogmoteLink
