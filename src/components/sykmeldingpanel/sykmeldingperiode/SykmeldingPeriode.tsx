import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'
import { CalendarIcon } from '@navikt/aksel-icons'

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/graphql.generated'
import { formatDatePeriod } from '../../../utils/dateUtils'
import { getPeriodTitle, getReadableLength } from '../../../utils/sykmeldingPeriodUtils'
import { cleanId } from '../../../utils/stringUtils'
import { IconHeading } from '../../shared/IconHeading/IconHeading'

interface Props {
    perioder: SykmeldingPeriodeFragment[]
}

const title = 'Sykmeldingsperioder (f.o.m. - t.o.m.)'

function SykmeldingPeriode({ perioder }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={CalendarIcon} />
            <ul className="py-5 px-7 bg-gray-50 rounded print:py-0">
                {perioder.map((periode: SykmeldingPeriodeFragment) => (
                    <li key={periode.fom} className="[&:not(:last-of-type)]:mb-6">
                        <BodyShort id={`periode-${periode.fom}`} size="small" className="font-semibold">
                            {getPeriodTitle(periode)} {formatDatePeriod(periode.fom, periode.tom)}
                        </BodyShort>
                        <div className="list-none p-0" aria-labelledby={`periode-${periode.fom}`}>
                            <BodyShort className="[&:not(:last-of-type)]:mb-1" size="small">
                                {getReadableLength(periode)}
                            </BodyShort>
                        </div>
                    </li>
                ))}
            </ul>
        </li>
    )
}

export default SykmeldingPeriode
