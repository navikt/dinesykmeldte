import React, { ReactElement } from 'react'

import { SoknadSporsmalFragment } from '../../../graphql/queries/graphql.generated'

import { SporsmalVarianter } from './SporsmalVarianter'
import SporsmalList from './shared/SporsmalList'

interface UndersporsmalProps {
    sporsmalsliste: SoknadSporsmalFragment[]
}

function Undersporsmal({ sporsmalsliste }: UndersporsmalProps): ReactElement | null {
    if (!sporsmalsliste || sporsmalsliste.length === 0) return null

    return (
        <SporsmalList>
            {sporsmalsliste.map((sporsmal: SoknadSporsmalFragment) => {
                return <SporsmalVarianter key={sporsmal.sporsmalstekst} sporsmal={sporsmal} />
            })}
        </SporsmalList>
    )
}

export default Undersporsmal
