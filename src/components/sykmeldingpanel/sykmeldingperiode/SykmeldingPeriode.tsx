import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import { CalendarIcon } from '@navikt/aksel-icons'

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/graphql.generated'
import { formatDatePeriod } from '../../../utils/dateUtils'
import { getPeriodTitle, getReadableLength } from '../../../utils/sykmeldingPeriodUtils'
import { cleanId } from '../../../utils/stringUtils'
import { IconHeading } from '../../shared/IconHeading/IconHeading'

interface Props {
    perioder: SykmeldingPeriodeFragment[]
}

const title = 'Perioder (f.o.m. - t.o.m.)'

function SykmeldingPeriode({ perioder }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={CalendarIcon} />
            <div className="rounded bg-blue-50 p-4">
                {perioder.map((periode: SykmeldingPeriodeFragment) => (
                    <div key={periode.fom} className="[&:not(:last-of-type)]:mb-4">
                        <Heading id={`periode-${periode.fom}`} size="xsmall" level="4">
                            {getPeriodTitle(periode)}
                        </Heading>
                        <ul className="list-none p-0" aria-labelledby={`periode-${periode.fom}`}>
                            {periode.fom && periode.tom && (
                                <BodyShort className="[&:not(:last-of-type)]:mb-1" as="li" size="small">
                                    {formatDatePeriod(periode.fom, periode.tom)}
                                </BodyShort>
                            )}
                            <BodyShort className="[&:not(:last-of-type)]:mb-1" as="li" size="small">
                                {getReadableLength(periode)}
                            </BodyShort>
                        </ul>
                    </div>
                ))}
            </div>
        </li>
    )
}

export default SykmeldingPeriode
