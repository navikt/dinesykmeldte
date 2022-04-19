import React from 'react';
import { Bandage } from '@navikt/ds-icons';
import { Heading, Panel } from '@navikt/ds-react';

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated';
import { formatDate } from '../../utils/dateUtils';
import CheckboxExplanation from '../shared/checkboxexplanation/CheckboxExplanation';
import { ListItem } from '../shared/listItem/ListItem';
import { createPeriodeKey } from '../../utils/sykmeldingPeriodUtils';
import { getBirthday } from '../../utils/stringUtils';

import SykmeldingPeriode from './sykmeldingperiode/SykmeldingPeriode';
import styles from './SykmeldingPanel.module.css';

interface Props {
    sykmelding: SykmeldingFragment;
}

function SykmeldingPanel({ sykmelding }: Props): JSX.Element {
    return (
        <Panel border className={styles.panelRoot}>
            <section aria-labelledby="sykmeldinger-panel-info-section" className={styles.infoSection}>
                <div className={styles.iconHeader}>
                    <Bandage />
                    <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
                        Opplysninger fra sykmeldingen
                    </Heading>
                </div>
                <ul className={styles.sykmeldingListItemList}>
                    <ListItem title="Sykmeldingen gjelder" text={[sykmelding.navn, getBirthday(sykmelding.fnr)]} />
                    <ListItem
                        title="Arbeidsgiver som legen har skrevet inn"
                        text={sykmelding.arbeidsgiver.navn ?? 'Ukjent'}
                    />
                    <ListItem title="Dato sykmeldingen ble skrevet" text={formatDate(sykmelding.behandletTidspunkt)} />
                    <ListItem title="Lege / Sykmelder" text={sykmelding.behandler.navn ?? 'Ukjent'} />
                </ul>
            </section>
            <section aria-labelledby="sykmeldinger-panel-arbeid-section">
                <Heading size="medium" level="2" spacing id="sykmeldinger-panel-arbeid-section">
                    Muligheter for arbeid
                </Heading>
                <ul className={styles.sykmeldingListItemList}>
                    {sykmelding.perioder.map((it) => {
                        return <SykmeldingPeriode key={createPeriodeKey(it)} periode={it} />;
                    })}
                </ul>
                <ul className={styles.sykmeldingListItemList}>
                    {sykmelding.arbeidsforEtterPeriode != null && (
                        <li aria-labelledby="friskmelding-prognose">
                            <Heading id="friskmelding-prognose" size="medium" level="2">
                                Friskmelding/Prognose
                            </Heading>
                            <CheckboxExplanation
                                text={
                                    sykmelding.arbeidsforEtterPeriode
                                        ? 'Pasienten er 100% arbeidsfør etter denne perioden'
                                        : 'Pasienten er ikke arbeidsfør etter denne perioden'
                                }
                            />
                        </li>
                    )}
                    <ListItem
                        title="Eventuelle hensyn som må tas på arbeidsplassen"
                        text={sykmelding.tiltakArbeidsplassen ?? 'Ingen hensyn spesifisert'}
                    />
                </ul>
                <Heading size="medium" level="2">
                    Annet
                </Heading>
                <ul className={styles.sykmeldingListItemList}>
                    <ListItem title="Telefon til lege/sykmelder" text={sykmelding.behandler.telefon ?? 'Ukjent'} />
                </ul>
            </section>
        </Panel>
    );
}

export default SykmeldingPanel;
