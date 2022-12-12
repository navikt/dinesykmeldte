import React from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { SoknadperiodeFragment } from '../../graphql/queries/graphql.generated'
import { formatDatePeriod } from '../../utils/dateUtils'
import { getSoknadSykmeldingPeriodDescription } from '../../utils/soknadUtils'
import { cleanId } from '../../utils/stringUtils'

import styles from './SoknadPerioder.module.css'

interface Props {
    perioder: SoknadperiodeFragment[]
}

function SoknadPerioder({ perioder }: Props): JSX.Element {
    const listItemId = cleanId('Søknaden gjelder for perioden')

    return (
        <li className={styles.blueListItem} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="small" className={styles.heading} level="3">
                Perioden det gjelder (f.o.m. - t.o.m.)
            </Heading>
            <ul className={styles.periodeList}>
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
