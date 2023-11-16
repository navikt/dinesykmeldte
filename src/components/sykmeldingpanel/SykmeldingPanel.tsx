import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { PrinterSmallIcon } from '@navikt/aksel-icons'

import { cn } from '../../utils/tw-utils'
import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { formatDate } from '../../utils/dateUtils'
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils'
import { logAmplitudeEvent } from '../../amplitude/amplitude'

import SykmeldingPeriode from './sykmeldingperiode/SykmeldingPeriode'
import SykmeldingenGjelder from './SykmeldingenGjelder'
import AnnenInfo from './AnnenInfo'
import MulighetForArbeidList from './MulighetForArbeidList'
import FriskmeldingPrognose from './FriskmeldingPrognose'
import MeldingTilArbeidsgiver from './MeldingTilArbeidsgiver'
import Egenmeldingsdager from './Egenmeldingsdager'

interface Props {
    sykmelding: SykmeldingFragment
}

function SykmeldingPanel({ sykmelding }: Props): ReactElement {
    return (
        <div className="max-w-2xl">
            <section className="my-2 flex flex-col gap-1" aria-labelledby="sykmeldinger-panel-info-section">
                <Heading size="small" level="2" id="sykmeldinger-panel-info-section">
                    Opplysninger fra sykmeldingen
                </Heading>
                <div
                    className={cn('flex justify-between', {
                        'h-0 justify-end [&>button]:-top-10 [&>button]:h-8': !sykmelding.sendtTilArbeidsgiverDato,
                    })}
                >
                    {sykmelding.sendtTilArbeidsgiverDato && (
                        <BodyShort className="text-gray-600 mb-6" size="small">
                            {`Sendt til deg ${formatDate(sykmelding.sendtTilArbeidsgiverDato)}`}
                        </BodyShort>
                    )}
                    <Button
                        onClick={() => {
                            logAmplitudeEvent({
                                eventName: 'last ned',
                                data: {
                                    type: 'sykmelding',
                                    tema: 'Sykmelding',
                                    tittel: 'Lag PDF versjon av sykmeldingen',
                                },
                            })
                            window.print()
                        }}
                        variant="tertiary"
                        size="small"
                        className="relative bottom-3 p-1 print:hidden max-[720px]:hidden"
                        icon={<PrinterSmallIcon title="Skriv ut sykmeldingen" />}
                    >
                        Skriv ut
                    </Button>
                </div>
            </section>
            <ul className="list-none p-0 grid gap-3">
                <SykmeldingenGjelder name={sykmelding.navn} fnr={addSpaceAfterEverySixthCharacter(sykmelding.fnr)} />
                <SykmeldingPeriode perioder={sykmelding.perioder} />
                <Egenmeldingsdager egenmeldingsdager={sykmelding.egenmeldingsdager} />
                <AnnenInfo sykmelding={sykmelding} />
                <MulighetForArbeidList sykmelding={sykmelding} />
                <FriskmeldingPrognose sykmelding={sykmelding} />
                <MeldingTilArbeidsgiver sykmelding={sykmelding} />
            </ul>
        </div>
    )
}

export default SykmeldingPanel
