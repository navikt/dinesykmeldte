import React from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import { Calender } from '@navikt/ds-icons'

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/graphql.generated'
import { formatDatePeriod } from '../../../utils/dateUtils'
import { getPeriodTitle, getReadableLength } from '../../../utils/sykmeldingPeriodUtils'
import { cleanId } from '../../../utils/stringUtils'
import { IconHeading } from '../../shared/IconHeading/IconHeading'

import styles from './SykmeldingPeriode.module.css'

interface Props {
    perioder: SykmeldingPeriodeFragment[]
}

const title = 'Perioder (f.o.m. - t.o.m.)'

function SykmeldingPeriode({ perioder }: Props): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li className={styles.sykmeldingPeriode} aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Calender} />
            <div className={styles.periods}>
                {perioder.map((periode: SykmeldingPeriodeFragment) => (
                    <div key={periode.fom} className={styles.periode}>
                        <Heading id={`periode-${periode.fom}`} size="xsmall" level="4">
                            {getPeriodTitle(periode)}
                        </Heading>
                        <ul className={styles.periodeList} aria-labelledby={`periode-${periode.fom}`}>
                            {periode.fom && periode.tom && (
                                <BodyShort as="li" size="small">
                                    {formatDatePeriod(periode.fom, periode.tom)}
                                </BodyShort>
                            )}
                            <BodyShort as="li" size="small">
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
