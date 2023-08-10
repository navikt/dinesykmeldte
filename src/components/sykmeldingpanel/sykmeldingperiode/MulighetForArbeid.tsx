import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/graphql.generated'
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation'

import { getArbeidsrelatertArsakText, getPeriodeDateRange, getPeriodeTitle } from './sykmeldigPeriodeUtils'

interface Props {
    periode: SykmeldingPeriodeFragment
}

function MulighetForArbeid({ periode }: Props): ReactElement {
    const periodeId = `${periode.fom}-${periode.tom}-header`

    return (
        <li aria-labelledby={periodeId}>
            <Heading className="mb-1" id={periodeId} size="xsmall" level="4">
                {getPeriodeTitle(periode)}
            </Heading>
            <BodyShort className="mb-4" size="small">
                {getPeriodeDateRange(periode)}
            </BodyShort>
            <SykmeldingPeriodeDetail periode={periode} />
        </li>
    )
}

function SykmeldingPeriodeDetail({ periode }: Pick<Props, 'periode'>): ReactElement | null {
    switch (periode.__typename) {
        case 'AktivitetIkkeMulig':
            if (periode.arbeidsrelatertArsak) {
                return (
                    <div className="[&_p:last-of-type]:mb-0">
                        <Heading className="text-sm" size="xsmall" level="5">
                            Forhold på arbeidsplassen vanskeliggjør arbeidsrelatert aktivitet
                        </Heading>
                        {periode.arbeidsrelatertArsak.arsak.map((arsak) => (
                            <CheckboxExplanation key={arsak} text={getArbeidsrelatertArsakText(arsak)} />
                        ))}
                        {periode.arbeidsrelatertArsak.beskrivelse && (
                            <div>
                                <Heading className="mt-4 text-sm" size="xsmall" level="6">
                                    Nærmere beskrivelse:
                                </Heading>
                                <BodyShort size="small">{periode.arbeidsrelatertArsak.beskrivelse}</BodyShort>
                            </div>
                        )}
                    </div>
                )
            }
            return <div />
        case 'Avventende':
            return (
                <div>
                    <Heading className="text-sm" size="xsmall" level="5">
                        Innspill til arbeidsgiver om tilrettelegging
                    </Heading>
                    <BodyShort size="small">{periode.tilrettelegging}</BodyShort>
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
