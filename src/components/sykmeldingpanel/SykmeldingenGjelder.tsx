import { Calender } from '@navikt/ds-icons'
import { BodyShort } from '@navikt/ds-react'

import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'

interface Props {
    name: string
    fnr: string
}

const title = 'Sykmeldingen gjelder'

function SykmeldingenGjelder({ name, fnr }: Props): JSX.Element | null {
    if (!name || !fnr) return null
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Calender} />
            <ul className="list-none rounded bg-gray-50 p-4">
                <BodyShort as="li" size="small">
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
