import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { cleanId } from '../../../utils/stringUtils'
import { getSoknadTallLabel } from '../../../utils/soknadUtils'
import { notNull } from '../../../utils/tsUtils'
import { SoknadSporsmalSvartypeEnum } from '../../../graphql/queries/graphql.generated'

import { SporsmalVarianterProps } from './SporsmalVarianter'
import SporsmalListItem from './shared/SporsmalListItem'
import SporsmalList from './shared/SporsmalList'
import SporsmalListItemNested from './shared/SporsmalListItemNested'

function Tall({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
    if (!sporsmal.svar || !sporsmal.svar[0]) return null

    const listItemId = cleanId(sporsmal.id)
    const label = getSoknadTallLabel(sporsmal) || sporsmal.undertekst

    return (
        <SporsmalListItem listItemId={listItemId}>
            <Heading id={listItemId} className="text-base" size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <SporsmalList>
                {sporsmal.svar.filter(notNull).map((svar) => {
                    const svarId = cleanId(svar.verdi)
                    let verdi = svar.verdi

                    if (sporsmal.svartype === SoknadSporsmalSvartypeEnum.Belop) {
                        verdi = (Number(svar.verdi) / 100).toString()
                    }
                    return (
                        <SporsmalListItemNested listItemId={svarId} key={svarId}>
                            <BodyShort id={svarId} size="small">
                                {verdi} {label}
                            </BodyShort>
                        </SporsmalListItemNested>
                    )
                })}
            </SporsmalList>
        </SporsmalListItem>
    )
}

export default Tall
