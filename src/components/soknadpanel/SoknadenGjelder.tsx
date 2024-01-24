import { PersonIcon } from '@navikt/aksel-icons'
import { BodyShort } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { fnrText } from '../../utils/sykmeldtUtils'

interface Props {
    name: string
    fnr: string
}

const title = 'Søknaden er sendt inn av'

function SoknadenGjelder({ name, fnr }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={PersonIcon} />
            <ul className="list-none py-5 px-7 bg-gray-50 rounded print:py-0">
                <BodyShort as="li" size="small" className="font-semibold">
                    {name}
                </BodyShort>
                <BodyShort as="li" size="small">
                    {fnrText(fnr)}
                </BodyShort>
            </ul>
        </li>
    )
}

export default SoknadenGjelder
