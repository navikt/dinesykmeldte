import React from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { Print } from '@navikt/ds-icons'

import { SoknadFragment } from '../../graphql/queries/graphql.generated'
import { ListItem } from '../shared/listItem/ListItem'
import { formatDate } from '../../utils/dateUtils'
import { shouldSporsmalVariantShow, getSoknadSykmeldingPeriod } from '../../utils/soknadUtils'
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils'
import { logAmplitudeEvent, useLogAmplitudeEvent } from '../../amplitude/amplitude'

import { SporsmalVarianter } from './SporsmalVarianter/SporsmalVarianter'
import SoknadPerioder from './SoknadPerioder'

interface Props {
    soknad: SoknadFragment
}

function SoknadPanel({ soknad }: Props): JSX.Element {
    useLogAmplitudeEvent(
        { eventName: 'skjema startet', data: { skjemanavn: 'marker sendt soknad som lest' } },
        { korrigert: soknad.korrigererSoknadId != null },
        () => !soknad.lest,
    )

    return (
        <section
            className="mb-18 max-w-2xl p-0 print:m-0 [&_h3]:text-base"
            aria-labelledby="soknad-oppsummering-section"
        >
            <div className="mb-2 flex flex-col">
                <Heading id="soknad-oppsummering-section" size="medium" level="2">
                    Oppsummering fra søknaden
                </Heading>
                <ul className="mb-2 mt-1 list-none p-0">
                    {soknad.perioder.map((it) => (
                        <li key={it.fom} className="mb-1 text-base font-semibold">
                            {getSoknadSykmeldingPeriod(it)}
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between">
                    <BodyShort className="text-gray-600" size="small">
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
                        className="relative -right-3 bottom-2 p-1 print:hidden max-[720px]:hidden [&>svg]:h-5"
                        icon={<Print title="Lag PDF versjon av søknaden" />}
                    />
                </div>
            </div>
            <ul className="list-none p-0">
                <ListItem
                    title="Søknaden er sendt inn av"
                    text={[soknad.navn, addSpaceAfterEverySixthCharacter(soknad.fnr)]}
                    headingLevel="3"
                    blueListItem
                />
                {soknad.perioder.length > 0 && <SoknadPerioder perioder={soknad.perioder} />}
                {soknad.sporsmal
                    .filter((spm) => shouldSporsmalVariantShow(spm))
                    .map((sporsmal) => {
                        return <SporsmalVarianter key={sporsmal.id} sporsmal={sporsmal} />
                    })}
            </ul>
        </section>
    )
}

export default SoknadPanel
