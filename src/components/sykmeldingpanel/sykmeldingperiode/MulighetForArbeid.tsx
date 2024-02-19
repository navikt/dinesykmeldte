import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { SykmeldingPeriodeFragment } from '../../../graphql/queries/graphql.generated'
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation'

import { getArbeidsrelatertArsakText, getPeriodeDateRange, getPeriodeTitle } from './sykmeldigPeriodeUtils'
import SykmeldingInfoMissing from '../../shared/SykmeldingInfoMissing'

interface Props {
    periode: SykmeldingPeriodeFragment
}

function MulighetForArbeid({ periode }: Props): ReactElement {
    const periodeId = `${periode.fom}-${periode.tom}-header`

    return (
        <li className="py-5 px-7 bg-gray-50 rounded print:py-2" aria-labelledby={periodeId}>
            <Heading className="mb-1 text-base" id={periodeId} size="small" level="4">
                {getPeriodeTitle(periode)}
            </Heading>
            <BodyShort size="small">{getPeriodeDateRange(periode)}</BodyShort>
            <SykmeldingPeriodeDetail periode={periode} />
        </li>
    )
}

function SykmeldingPeriodeDetail({ periode }: Pick<Props, 'periode'>): ReactElement | null {
    switch (periode.__typename) {
        case 'AktivitetIkkeMulig':
            if (periode.arbeidsrelatertArsak) {
                return (
                    <div className="mt-6">
                        <Heading className="text-base" size="xsmall" level="5">
                            Forhold på arbeidsplassen vanskeliggjør arbeidsrelatert aktivitet
                        </Heading>
                        {periode.arbeidsrelatertArsak.arsak.map((arsak) => (
                            <CheckboxExplanation key={arsak} text={getArbeidsrelatertArsakText(arsak)} />
                        ))}
                        {periode.arbeidsrelatertArsak.beskrivelse && (
                            <div>
                                <Heading className="mt-4 text-base" size="xsmall" level="6">
                                    Nærmere beskrivelse
                                </Heading>
                                <BodyShort size="small">{periode.arbeidsrelatertArsak.beskrivelse}</BodyShort>
                            </div>
                        )}
                    </div>
                )
            }
            return (
                <div className="mt-4">
                    <SykmeldingInfoMissing
                        heading="Forhold på arbeidsplassen vanskeliggjør arbeidsrelatert aktivitet"
                        text="Ikke utfylt av behandler"
                    />
                </div>
            )
        case 'Avventende':
            return (
                <>
                    {periode.tilrettelegging && (
                        <div className="mt-6">
                            <Heading className="text-base" size="xsmall" level="5">
                                Innspill til arbeidsgiver om tilrettelegging
                            </Heading>
                            <BodyShort size="small">{periode.tilrettelegging}</BodyShort>
                        </div>
                    )}
                </>
            )
        case 'Gradert':
            return (
                <>
                    {periode.reisetilskudd && (
                        <div className="mt-4">
                            <CheckboxExplanation text="Pasienten kan være i delvis arbeid ved bruk av reisetilskudd" />
                        </div>
                    )}
                </>
            )
        case 'Behandlingsdager':
            return null
        case 'Reisetilskudd':
            return null
    }
}

export default MulighetForArbeid
