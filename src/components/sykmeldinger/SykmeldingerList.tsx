import React from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';
import { useQuery } from '@apollo/client';

import { PreviewSykmeldtFragment, SykmeldingByIdDocument } from '../../graphql/queries/graphql.generated';
import LinkPanel from '../shared/links/LinkPanel';
import { formatDateRange } from '../../utils/dateUtils';
import Skeleton from '../shared/Skeleton/Skeleton';
import { partition } from '../../utils/tsUtils';
import { formatNameSubjective } from '../../utils/sykmeldtUtils';
import { getSykmeldingPeriodDescription } from '../../utils/sykmeldingPeriodUtils';

import styles from './SykmeldingerList.module.css';

interface Props {
    sykmeldtId: string;
    sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldingerList({ sykmeldtId, sykmeldt }: Props): JSX.Element {
    const [readSykmeldinger, unreadSykmeldinger] = partition((it) => it.lest, sykmeldt.previewSykmeldinger);

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
                        {unreadSykmeldinger.map((it) => (
                            <Cell key={it.id} xs={12}>
                                <LinkPanel
                                    href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                    Icon={Bandage}
                                    detail={formatDateRange(it.fom, it.tom)}
                                    description={<SykmeldingDescription sykmeldingId={it.id} />}
                                    notify
                                >
                                    Sykmelding
                                </LinkPanel>
                            </Cell>
                        ))}
                    </Grid>
                </section>
            )}
            {hasRead && (
                <section aria-labelledby="sykmeldinger-list-leste-header">
                    <Heading id="sykmeldinger-list-leste-header" size="medium" level="2" className={styles.listHeader}>
                        Leste
                    </Heading>
                    <Grid>
                        {readSykmeldinger.map((it) => (
                            <Cell key={it.id} xs={12}>
                                <LinkPanel
                                    href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                                    Icon={Bandage}
                                    detail={formatDateRange(it.fom, it.tom)}
                                    description={<SykmeldingDescription sykmeldingId={it.id} />}
                                >
                                    Sykmelding
                                </LinkPanel>
                            </Cell>
                        ))}
                    </Grid>
                </section>
            )}
        </div>
    );
}

function SykmeldingDescription({ sykmeldingId }: { sykmeldingId: string }): JSX.Element {
    const { loading, data, error } = useQuery(SykmeldingByIdDocument, { variables: { sykmeldingId } });

    if (loading) {
        return <Skeleton width={Math.random() * 200 + 100} />;
    }

    if (error) {
        return <div>Feil: Klarte ikke å hente sykmeldingperiode</div>;
    }

    return <div>{data?.sykmelding?.perioder.map((it) => getSykmeldingPeriodDescription(it)).join(', ')}</div>;
}

export default SykmeldingerList;
