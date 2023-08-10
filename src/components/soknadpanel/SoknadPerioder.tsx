import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { SoknadperiodeFragment } from '../../graphql/queries/graphql.generated'
import { formatDatePeriod } from '../../utils/dateUtils'
import { getSoknadSykmeldingPeriodDescription } from '../../utils/soknadUtils'
import { cleanId } from '../../utils/stringUtils'

interface Props {
    perioder: SoknadperiodeFragment[]
}

function SoknadPerioder({ perioder }: Props): ReactElement {
    const listItemId = cleanId('Søknaden gjelder for perioden')

    return (
        <li
            className="mb-4 rounded bg-blue-50 p-5 [&_p:not(:last-of-type)]:mb-1 [&_p]:text-base"
            aria-labelledby={listItemId}
        >
            <Heading id={listItemId} size="small" className="mb-1" level="3">
                Perioden det gjelder (f.o.m. - t.o.m.)
            </Heading>
            <ul className="list-none p-0">
                {perioder.map((periode: SoknadperiodeFragment, index: number) => {
                    return (
                        <li key={index}>
                            {periode.fom && periode.tom && (
                                <BodyShort>{formatDatePeriod(periode.fom, periode.tom)}</BodyShort>
                            )}
                            <BodyShort>{getSoknadSykmeldingPeriodDescription(periode)}</BodyShort>
                        </li>
                    )
                })}
            </ul>
        </li>
    )
}

export default SoknadPerioder
