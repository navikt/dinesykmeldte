import React from 'react';
import { Bandage } from '@navikt/ds-icons';
import { BodyShort, Heading, Panel } from '@navikt/ds-react';
import { useQuery } from '@apollo/client';

import { SykmeldingByIdDocument } from '../../graphql/queries/graphql.generated';
import { formatDate, formatDatePeriod } from '../../utils/dateUtils';
import { ListItem } from '../shared/listItem/ListItem';
import PageFallbackLoader from '../shared/pagefallbackloader/PageFallbackLoader';
import { getSykmeldingPeriodDescription } from '../../utils/sykmeldingPeriodUtils';
import PageError from '../shared/errors/PageError';

import styles from './SykmeldingPanelShort.module.css';

interface Props {
    sykmeldingId: string;
}

function SykmeldingPanelShort({ sykmeldingId }: Props): JSX.Element {
    const { data, loading, error } = useQuery(SykmeldingByIdDocument, { variables: { sykmeldingId } });

    if (loading) return <PageFallbackLoader text="Laster sykmelding" />;
    if (error || !data?.sykmelding) return <PageError text="Klarte ikke å laste søknadens sykmelding" />;

    return (
        <Panel border className={styles.panelRoot}>
            <section aria-labelledby="sykmeldinger-panel-info-section">
                <div className={styles.iconHeader}>
                    <Bandage />
                    <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
                        Opplysninger fra sykmeldingen
                    </Heading>
                </div>
                <ul className={styles.sykmeldingListItemList}>
                    <ListItem title="Sykmeldingen gjelder" text={[data.sykmelding.navn, data.sykmelding.fnr]} />
                    <li className={styles.listItem}>
                        <Heading size="small" className={styles.periodHeading} level="3">
                            Sykmeldingen gjelder for perioden
                        </Heading>
                        {data.sykmelding.perioder.map((it, index) => (
                            <div className={styles.period} key={index}>
                                <BodyShort>{formatDatePeriod(it.fom, it.tom)}</BodyShort>
                                <BodyShort>{getSykmeldingPeriodDescription(it)}</BodyShort>
                            </div>
                        ))}
                    </li>
                    <ListItem
                        title="Arbeidsgiver som legen har skrevet inn"
                        text={data.sykmelding.arbeidsgiver.navn ?? 'Ukjent'}
                    />
                    <ListItem
                        title="Dato sykmeldingen ble skrevet"
                        text={formatDate(data.sykmelding.behandletTidspunkt)}
                    />
                </ul>
            </section>
        </Panel>
    );
}

export default SykmeldingPanelShort;
