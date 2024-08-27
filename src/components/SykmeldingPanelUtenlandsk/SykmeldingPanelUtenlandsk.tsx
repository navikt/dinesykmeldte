import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { PrinterSmallIcon } from '@navikt/aksel-icons'

import { cn } from '../../utils/tw-utils'
import { formatDate } from '../../utils/dateUtils'
import SykmeldingPeriode from '../sykmeldingpanel/sykmeldingperiode/SykmeldingPeriode'
import { UtenlandskSykmelding } from '../../utils/utenlanskUtils'
import SykmeldingenGjelder from '../sykmeldingpanel/SykmeldingenGjelder'
import AnnenInfo from '../sykmeldingpanel/AnnenInfo'

interface Props {
    sykmelding: UtenlandskSykmelding
}

function SykmeldingPanelUtenlandsk({ sykmelding }: Props): ReactElement {
    return (
        <section className="my-2 flex flex-col gap-1 max-w-2xl" aria-labelledby="sykmeldinger-panel-info-section">
            <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
                Opplysninger fra utenlandsk sykmelding
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
                        window.print()
                    }}
                    variant="tertiary"
                    size="small"
                    className="relative bottom-3 print:hidden max-[720px]:hidden"
                    icon={<PrinterSmallIcon title="Lag PDF versjon av sykmeldingen" />}
                >
                    Skriv ut
                </Button>
            </div>
            <ul className="list-none p-0">
                <SykmeldingenGjelder name={sykmelding.navn} fnr={sykmelding.fnr} />
                <SykmeldingPeriode perioder={sykmelding.perioder} />
                <AnnenInfo sykmelding={sykmelding} />
            </ul>
        </section>
    )
}

export default SykmeldingPanelUtenlandsk
