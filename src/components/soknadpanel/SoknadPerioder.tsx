import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { SoknadperiodeFragment } from '../../graphql/queries/graphql.generated';
import { formatDatePeriod } from '../../utils/dateUtils';
import { getSoknadSykmeldingPeriodDescription } from '../../utils/soknadUtils';
import { cleanId } from '../../utils/stringUtils';

import styles from './SoknadPerioder.module.css';

interface Props {
    perioder: SoknadperiodeFragment[];
}

function SoknadPerioder({ perioder }: Props): JSX.Element {
    const listItemId = cleanId('Søknaden gjelder for perioden');

    return (
        <li className={styles.soknadPeriode} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="small" className={styles.heading} level="3">
                Søknaden gjelder for perioden
            </Heading>
            {perioder.map((periode: SoknadperiodeFragment, index: number) => {
                return (
                    <div key={index}>
                        {periode.fom && periode.tom && (
                            <BodyShort>{formatDatePeriod(periode.fom, periode.tom)}</BodyShort>
                        )}
                        <BodyShort>{getSoknadSykmeldingPeriodDescription(periode)}</BodyShort>
                    </div>
                );
            })}
        </li>
    );
}

export default SoknadPerioder;
