import React from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { Print } from '@navikt/ds-icons'
import cn from 'classnames'

import { formatDate } from '../../utils/dateUtils'
import { ListItem } from '../shared/listItem/ListItem'
import { formatPeriodTextNowOrFuture } from '../../utils/sykmeldingPeriodUtils'
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils'
import { logAmplitudeEvent } from '../../amplitude/amplitude'
import SykmeldingPeriode from '../sykmeldingpanel/sykmeldingperiode/SykmeldingPeriode'
import { UtenlandskSykmelding } from '../../utils/utenlanskUtils'

import styles from './SykmeldingPanelUtenlandsk.module.css'

interface Props {
    sykmelding: UtenlandskSykmelding
}

function SykmeldingPanelUtenlandsk({ sykmelding }: Props): JSX.Element {
    return (
        <div className={styles.panelRoot}>
            <section className={styles.header} aria-labelledby="sykmeldinger-panel-info-section">
                <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
                    Opplysninger fra utenlandsk sykmelding
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
                                    type: 'utenlandsk sykmelding',
                                    tema: 'Utenlandsk Sykmelding',
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
                <ListItem
                    title="Sykmeldingen gjelder"
                    text={[sykmelding.navn, addSpaceAfterEverySixthCharacter(sykmelding.fnr)]}
                    headingLevel="3"
                />
                <SykmeldingPeriode perioder={sykmelding.perioder} />
                <li className={styles.sykmeldingListItem} aria-labelledby="sykmeldinger-panel-annet-section">
                    <Heading id="sykmeldinger-panel-annet-section" className={styles.underTitle} size="small" level="3">
                        Annet
                    </Heading>
                    <ul>
                        <ListItem
                            title="Dato sykmeldingen ble skrevet"
                            text={formatDate(sykmelding.behandletTidspunkt)}
                            headingLevel="4"
                        />
                        <ListItem
                            title="Landet sykmeldingen ble skrevet"
                            text={sykmelding.utenlandskSykmelding.land}
                            headingLevel="4"
                        />
                    </ul>
                </li>
            </ul>
        </div>
    )
}

export default SykmeldingPanelUtenlandsk
