import React from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { Print } from '@navikt/ds-icons'
import cn from 'classnames'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { formatDate } from '../../utils/dateUtils'
import { formatPeriodTextNowOrFuture } from '../../utils/sykmeldingPeriodUtils'
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils'
import { logAmplitudeEvent } from '../../amplitude/amplitude'
import { isEgenmeldingsdagerEnabled } from '../../utils/env'

import SykmeldingPeriode from './sykmeldingperiode/SykmeldingPeriode'
import SykmeldingenGjelder from './SykmeldingenGjelder'
import AnnenInfo from './AnnenInfo'
import MulighetForArbeidList from './MulighetForArbeidList'
import FriskmeldingPrognose from './FriskmeldingPrognose'
import MeldingTilArbeidsgiver from './MeldingTilArbeidsgiver'
import Egenmeldingsdager from './Egenmeldingsdager'
import styles from './SykmeldingPanel.module.css'

interface Props {
    sykmelding: SykmeldingFragment
}

function SykmeldingPanel({ sykmelding }: Props): JSX.Element {
    return (
        <div className={styles.panelRoot}>
            <section className={styles.header} aria-labelledby="sykmeldinger-panel-info-section">
                <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
                    Opplysninger fra sykmeldingen
                </Heading>
                <ul className={styles.periods}>
                    {sykmelding.perioder.map((it) => (
                        <li key={it.fom} className={styles.period}>
                            {formatPeriodTextNowOrFuture(it)}
                        </li>
                    ))}
                </ul>
                <div
                    className={cn(styles.sentDateAndPrint, {
                        [styles.onlyPrint]: !sykmelding.sendtTilArbeidsgiverDato,
                    })}
                >
                    {sykmelding.sendtTilArbeidsgiverDato && (
                        <BodyShort className={styles.sendtDate} size="small">
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
                        className={styles.printButton}
                        icon={<Print title="Lag PDF versjon av sykmeldingen" />}
                    />
                </div>
            </section>
            <ul className={styles.sykmeldingList}>
                <SykmeldingenGjelder name={sykmelding.navn} fnr={addSpaceAfterEverySixthCharacter(sykmelding.fnr)} />
                <SykmeldingPeriode perioder={sykmelding.perioder} />
                {isEgenmeldingsdagerEnabled() && <Egenmeldingsdager egenmeldingsdager={sykmelding.egenmeldingsdager} />}
                <AnnenInfo sykmelding={sykmelding} />
                <MulighetForArbeidList sykmelding={sykmelding} />
                <FriskmeldingPrognose sykmelding={sykmelding} />
                <MeldingTilArbeidsgiver sykmelding={sykmelding} />
            </ul>
        </div>
    )
}

export default SykmeldingPanel
