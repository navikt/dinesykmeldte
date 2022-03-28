import React from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment, SykmeldingFragment } from '../../graphql/queries/graphql.generated';
import LinkPanel from '../shared/links/LinkPanel';
import { formatDateRange } from '../../utils/dateUtils';
import { partition } from '../../utils/tsUtils';
import { formatNameSubjective } from '../../utils/sykmeldtUtils';
import { getSykmeldingPeriodDescription, getEarliestFom, getLatestTom } from '../../utils/sykmeldingPeriodUtils';

import styles from './SykmeldingerList.module.css';

interface Props {
    sykmeldtId: string;
    sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldingerList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const [readSykmeldinger, unreadSykmeldinger] = partition((it) => it.lest, sykmeldt.sykmeldinger);

    const hasUnread = unreadSykmeldinger.length > 0;
    const hasRead = readSykmeldinger.length > 0;

    return (
        <div className={styles.listRoot}>
            {!hasRead && !hasUnread && <div>Vi fant ingen sykmeldinger for {formatNameSubjective(sykmeldt.navn)}.</div>}
            {hasUnread && (
                <section aria-labelledby="sykmeldinger-list-uleste-header">
                    <Heading id="sykmeldinger-list-uleste-header" size="medium" level="2" className={styles.listHeader}>
                        Uleste
                    </Heading>
                    <Grid>
                        {unreadSykmeldinger.map((it) => {
                            const earliestFom = getEarliestFom(it);
                            const latestTom = getLatestTom(it);
                            return (
                                <Cell key={it.id} xs={12}>
                                    <LinkPanel
                                        href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                        Icon={Bandage}
                                        detail={formatDateRange(earliestFom, latestTom)}
                                        description={<SykmeldingDescription sykmelding={it} />}
                                        notify
                                    >
                                        Sykmelding
                                    </LinkPanel>
                                </Cell>
                            );
                        })}
                    </Grid>
                </section>
            )}
            {hasRead && (
                <section aria-labelledby="sykmeldinger-list-leste-header">
                    <Heading id="sykmeldinger-list-leste-header" size="medium" level="2" className={styles.listHeader}>
                        Leste
                    </Heading>
                    <Grid>
                        {readSykmeldinger.map((it) => {
                            const earliestFom = getEarliestFom(it);
                            const latestTom = getLatestTom(it);
                            return (
                                <Cell key={it.id} xs={12}>
                                    <LinkPanel
                                        href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                        Icon={Bandage}
                                        detail={formatDateRange(earliestFom, latestTom)}
                                        description={<SykmeldingDescription sykmelding={it} />}
                                    >
                                        Sykmelding
                                    </LinkPanel>
                                </Cell>
                            );
                        })}
                    </Grid>
                </section>
            )}
        </div>
    );
}

function SykmeldingDescription({ sykmelding }: { sykmelding: SykmeldingFragment }): JSX.Element {
    return <div>{sykmelding.perioder.map((it) => getSykmeldingPeriodDescription(it)).join(', ')}</div>;
}

export default SykmeldingerList;
