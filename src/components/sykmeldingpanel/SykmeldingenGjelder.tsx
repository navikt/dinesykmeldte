import { PersonIcon } from '@navikt/aksel-icons'
import { BodyShort } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'

interface Props {
    name: string
    fnr: string
}

const title = 'Sykmeldingen gjelder'

function SykmeldingenGjelder({ name, fnr }: Props): ReactElement | null {
    if (!name || !fnr) return null
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={PersonIcon} />
            <ul className="list-none rounded bg-gray-50 listpadding">
                <BodyShort as="li" size="small" className="font-semibold">
                    {name}
                </BodyShort>
                {fnr && (
                    <BodyShort as="li" size="small">
                        Fødselsnr: {fnr}
                    </BodyShort>
                )}
            </ul>
        </li>
    )
}

export default SykmeldingenGjelder
