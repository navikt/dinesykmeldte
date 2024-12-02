import { HandshakeIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'

import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { ListItem } from '../shared/listItem/ListItem'

interface Props {
    tiltakArbeidsplassen: string | null | undefined
}

const title = 'Hva skal til for å bedre arbeidsevnen?'

function Arbeidsevne({ tiltakArbeidsplassen }: Props): ReactElement | null {
    const listItemId = cleanId(title)
    if (!tiltakArbeidsplassen) return null

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={HandshakeIcon} />
            <ul className="list-none py-5 px-7 bg-gray-50 rounded print:py-0">
                <ListItem
                    title="Tilrettelegging/hensyn som bør tas på arbeidsplassen"
                    text={tiltakArbeidsplassen}
                    headingLevel="4"
                />
            </ul>
        </li>
    )
}

export default Arbeidsevne
