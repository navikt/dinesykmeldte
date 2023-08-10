import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { PrinterSmallIcon } from '@navikt/aksel-icons'

import { cn } from '../../utils/tw-utils'
import { formatDate } from '../../utils/dateUtils'
import { formatPeriodTextNowOrFuture } from '../../utils/sykmeldingPeriodUtils'
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils'
import { logAmplitudeEvent } from '../../amplitude/amplitude'
import SykmeldingPeriode from '../sykmeldingpanel/sykmeldingperiode/SykmeldingPeriode'
import { UtenlandskSykmelding } from '../../utils/utenlanskUtils'
import SykmeldingenGjelder from '../sykmeldingpanel/SykmeldingenGjelder'
import AnnenInfo from '../sykmeldingpanel/AnnenInfo'

interface Props {
    sykmelding: UtenlandskSykmelding
}

function SykmeldingPanelUtenlandsk({ sykmelding }: Props): ReactElement {
    return (
        <div className="max-w-2xl">
            <section className="my-2 flex flex-col" aria-labelledby="sykmeldinger-panel-info-section">
                <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
                    Opplysninger fra utenlandsk sykmelding
                </Heading>
                <ul className="my-2 list-none p-0">
                    {sykmelding.perioder.map((it) => (
                        <li key={it.fom} className="mb-1 text-base font-semibold">
                            {formatPeriodTextNowOrFuture(it)}
                        </li>
                    ))}
                </ul>
                <div
                    className={cn('flex justify-between', {
                        'h-0 justify-end [&>button]:-top-10 [&>button]:h-8': !sykmelding.sendtTilArbeidsgiverDato,
                    })}
                >
                    {sykmelding.sendtTilArbeidsgiverDato && (
                        <BodyShort className="text-gray-600" size="small">
                            {`Sendt til deg ${formatDate(sykmelding.sendtTilArbeidsgiverDato)}`}
                        </BodyShort>
                    )}
                    <Button
                        onClick={() => {
                            logAmplitudeEvent({
                                eventName: 'last ned',
                                data: {
                                    type: 'utenlandsk sykmelding',
                                    tema: 'Utenlandsk Sykmelding',
                                    tittel: 'Lag PDF versjon av sykmeldingen',
                                },
                            })
                            window.print()
                        }}
                        variant="tertiary"
                        className="relative -right-3.5 bottom-2 p-1 print:hidden max-[720px]:hidden"
                        icon={<PrinterSmallIcon title="Lag PDF versjon av sykmeldingen" />}
                    />
                </div>
            </section>
            <ul className="list-none p-0">
                <SykmeldingenGjelder name={sykmelding.navn} fnr={addSpaceAfterEverySixthCharacter(sykmelding.fnr)} />
                <SykmeldingPeriode perioder={sykmelding.perioder} />
                <AnnenInfo sykmelding={sykmelding} />
            </ul>
        </div>
    )
}

export default SykmeldingPanelUtenlandsk
