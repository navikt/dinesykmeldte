import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import parser from 'html-react-parser'

import { cleanId } from '../../../utils/stringUtils'

import { SporsmalVarianterProps } from './SporsmalVarianter'
import SporsmalListItem from './shared/SporsmalListItem'

function Undertekst({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
    if (!sporsmal.undertekst) return null

    const listItemId = cleanId(sporsmal.id)

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} className="text-base" size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <div className="mb-2 list-none text-base">{parser(sporsmal.undertekst)}</div>
        </SporsmalListItem>
    )
}

export default Undertekst
