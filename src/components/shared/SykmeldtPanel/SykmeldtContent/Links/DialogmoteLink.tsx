import React, { ReactElement } from 'react'
import { Chat2Icon, Chat2FillIcon } from '@navikt/aksel-icons'

import { DialogmoteFragment } from '../../../../../graphql/queries/graphql.generated'
import LinkPanel from '../../../links/LinkPanel'
import { getDialogmoterUrl } from '../../../../../utils/hendelseUtils'

import LinkMessageList from './LinkMessageList'

interface Props {
    sykmeldtId: string
    dialogmoter: DialogmoteFragment[]
}

const DialogmoteLink = ({ sykmeldtId, dialogmoter }: Props): ReactElement => {
    const dialogmoterUrl = getDialogmoterUrl(sykmeldtId)

    if (!dialogmoter.length) {
        return (
            <LinkPanel Icon={Chat2Icon} href={dialogmoterUrl}>
                Dialogmøter
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            Icon={Chat2FillIcon}
            href={dialogmoterUrl}
            hendelseIds={dialogmoter.map((it) => it.hendelseId)}
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
