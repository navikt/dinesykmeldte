import { Accordion, Alert, BodyShort, Loader, Table } from '@navikt/ds-react';
import { InformationFilled } from '@navikt/ds-icons';

import {
    PreviewSykmeldtFragment,
    SykmeldingFragment,
    SykmeldingPeriodeFragment,
    useSykmeldingerByIdsQuery,
} from '../../../../graphql/queries/react-query.generated';
import { formatNameSubjective, getLatestPeriod } from '../../../../utils/sykmeldtUtils';
import { formatDate, formatDatePeriod } from '../../../../utils/dateUtils';
import {
    createPeriodeKey,
    getRelativeSykmeldingPeriodStatus,
    getShortSykmeldingPeriodDescription,
    getSykmeldingPeriodDescription,
} from '../../../../utils/sykmeldingUtils';
import { notNull } from '../../../../utils/tsUtils';

import styles from './ExpandableSykmeldtSummary.module.css';

interface Props {
    previewSykmeldt: PreviewSykmeldtFragment;
}

export function ExpandableSykmeldtSummary({ previewSykmeldt }: Props): JSX.Element {
    const { isLoading, data, error } = useSykmeldingerByIdsQuery({
        ids: previewSykmeldt.previewSykmeldinger.map((it) => it.id),
    });

    const latestPeriod = data?.sykmeldinger.length ? getLatestPeriod(data.sykmeldinger) : null;
    const isError = error || (!isLoading && !latestPeriod);

    if (isError) {
        return (
            <Alert className={styles.noSykmeldingAlert} variant="error">
                Klarte ikke å laste sykmeldingene
            </Alert>
        );
    }

    return (
        <Accordion className={styles.accordionRoot}>
            {!isError && (
                <Accordion.Item>
                    <Accordion.Header className={styles.accordionHeader}>
                        <InformationFilled className={styles.infoIcon} />
                        {isLoading && <Loader size="small" variant="interaction" />}
                        {!isLoading && latestPeriod && (
                            <SummaryHeaderContent navn={previewSykmeldt.navn} period={latestPeriod} />
                        )}
                    </Accordion.Header>
                    <Accordion.Content className={styles.accordionContent}>
                        {data?.sykmeldinger && <SummaryContent sykmeldinger={data.sykmeldinger} />}
                    </Accordion.Content>
                </Accordion.Item>
            )}
        </Accordion>
    );
}

function SummaryContent({ sykmeldinger }: { sykmeldinger: (SykmeldingFragment | null)[] }): JSX.Element {
    const failedCount = sykmeldinger.filter((it) => !notNull(it)).length;
    return (
        <div>
            <BodyShort>Oversikten viser sykmeldingsperioder for inntil 4 måneder tilbake i tid.</BodyShort>
            {failedCount > 0 && (
                <Alert variant="error">
                    Klarte ikke å hente {failedCount} av {sykmeldinger?.length} sykmeldinger
                </Alert>
            )}
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Sykmeldingsperiode</Table.HeaderCell>
                        <Table.HeaderCell>Type</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sykmeldinger
                        ?.flatMap((it) => it?.perioder)
                        ?.filter(notNull)
                        .map((it) => (
                            <Table.Row key={createPeriodeKey(it)}>
                                <Table.DataCell>{formatDatePeriod(it.fom, it.tom)}</Table.DataCell>
                                <Table.DataCell>{getShortSykmeldingPeriodDescription(it)}</Table.DataCell>
                                <Table.DataCell>{getRelativeSykmeldingPeriodStatus(it)}</Table.DataCell>
                            </Table.Row>
                        ))}
                </Table.Body>
            </Table>
        </div>
    );
}

function SummaryHeaderContent(props: { navn: string; period: SykmeldingPeriodeFragment }): JSX.Element {
    return (
        <>
            <div className={styles.headerLabelWrapper}>
                <BodyShort size="small">
                    {formatNameSubjective(props.navn.split(' ')[0])} er {getSykmeldingPeriodDescription(props.period)}{' '}
                    til {formatDate(props.period.tom)}
                </BodyShort>
            </div>
            <BodyShort size="small">Se mer</BodyShort>
        </>
    );
}
