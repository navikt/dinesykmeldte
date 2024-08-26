import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { TasklistIcon } from '@navikt/aksel-icons'

import { SoknadFragment } from '../../graphql/queries/graphql.generated'
import { formatDate } from '../../utils/dateUtils'
import { logAmplitudeEvent, useLogAmplitudeEvent } from '../../amplitude/amplitude'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { cleanId } from '../../utils/stringUtils'

import { SporsmalVarianter } from './SporsmalVarianter/SporsmalVarianter'
import SoknadPerioder from './SoknadPerioder'
import SoknadenGjelder from './SoknadenGjelder'

interface Props {
    soknad: SoknadFragment
}

const title = 'Spørsmål fra søknaden'

function SoknadPanel({ soknad }: Props): ReactElement {
    useLogAmplitudeEvent(
        { eventName: 'skjema startet', data: { skjemanavn: 'marker sendt soknad som lest' } },
        { korrigert: soknad.korrigererSoknadId != null },
        () => !soknad.lest,
    )

    const listItemId = cleanId(title)

    return (
        <section
            className="my-2 flex flex-col gap-1 max-w-2xl mb-10 print:m-0"
            aria-labelledby="soknad-oppsummering-section"
        >
            <Heading id="soknad-oppsummering-section" size="medium" level="2">
                Oppsummering fra søknaden
            </Heading>
            <div className="flex justify-between">
                <BodyShort className="text-gray-600 mb-6" size="small">
                    {`Sendt til deg ${formatDate(soknad.sendtDato)}`}
                </BodyShort>
                <Button
                    onClick={() => {
                        logAmplitudeEvent({
                            eventName: 'last ned',
                            data: { type: 'søknad', tema: 'Søknad', tittel: 'Lag PDF versjon av søknaden' },
                        })
                        window.print()
                    }}
                    variant="tertiary"
                    size="small"
                    className="relative bottom-3 print:hidden max-[720px]:hidden"
                    icon={<PrinterSmallIcon title="Skriv ut søknaden" />}
                >
                    Skriv ut
                </Button>
            </div>
            <ul className="list-none p-0">
                <SoknadenGjelder name={soknad.navn} fnr={soknad.fnr} />
                <SoknadPerioder perioder={soknad.perioder} />
                <li aria-labelledby={listItemId}>
                    <IconHeading title="Spørsmål fra søknaden" headingId={listItemId} Icon={TasklistIcon} />
                    <ul>
                        {soknad.sporsmal.map((sporsmal) => {
                            return <SporsmalVarianter key={sporsmal.id} sporsmal={sporsmal} />
                        })}
                    </ul>
                </li>
            </ul>
        </section>
    )
}

export default SoknadPanel
