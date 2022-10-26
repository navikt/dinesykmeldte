import React from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/graphql.generated'
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation'

import { getArbeidsrelatertArsakText, getPeriodeDateRange, getPeriodeTitle } from './sykmeldigPeriodeUtils'
import styles from './MulighetForArbeid.module.css'

interface Props {
    periode: SykmeldingPeriodeFragment
}

function MulighetForArbeid({ periode }: Props): JSX.Element {
    const periodeId = `${periode.fom}-${periode.tom}-header`

    return (
        <li aria-labelledby={periodeId}>
            <Heading className={styles.heading} id={periodeId} size="xsmall" level="4">
                {getPeriodeTitle(periode)}
            </Heading>
            <BodyShort className={styles.periodRange} size="small">
                {getPeriodeDateRange(periode)}
            </BodyShort>
            <SykmeldingPeriodeDetail periode={periode} />
        </li>
    )
}

function SykmeldingPeriodeDetail({ periode }: Pick<Props, 'periode'>): JSX.Element | null {
    switch (periode.__typename) {
        case 'AktivitetIkkeMulig':
            if (periode.arbeidsrelatertArsak) {
                return (
                    <div>
                        <Heading className={styles.underTitle} size="xsmall" level="5">
                            Forhold på arbeidsplassen vanskeliggjør arbeidsrelatert aktivitet
                        </Heading>
                        {periode.arbeidsrelatertArsak.arsak.map((arsak) => (
                            <CheckboxExplanation key={arsak} text={getArbeidsrelatertArsakText(arsak)} />
                        ))}
                        {periode.arbeidsrelatertArsak.beskrivelse && (
                            <div>
                                <Heading className={styles.beskrivelseTitle} size="xsmall" level="6">
                                    Nærmere beskrivelse:
                                </Heading>
                                <BodyShort className={styles.bodyShort} size="small">
                                    {periode.arbeidsrelatertArsak.beskrivelse}
                                </BodyShort>
                            </div>
                        )}
                    </div>
                )
            }
            return <div />
        case 'Avventende':
            return (
                <div>
                    <Heading className={styles.underTitle} size="xsmall" level="5">
                        Innspill til arbeidsgiver om tilrettelegging
                    </Heading>
                    <BodyShort className={styles.bodyShort} size="small">
                        {periode.tilrettelegging}
                    </BodyShort>
                </div>
            )
        case 'Gradert':
            return (
                <div>
                    {periode.reisetilskudd && (
                        <CheckboxExplanation text="Pasienten kan være i delvis arbeid ved bruk av reisetilskudd" />
                    )}
                </div>
            )
        case 'Behandlingsdager':
            return null
        case 'Reisetilskudd':
            return null
    }
}

export default MulighetForArbeid
