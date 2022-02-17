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
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

export function ExpandableSykmeldtSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
    const { isLoading, data, error } = useSykmeldingerByIdsQuery({
        ids: previewSykmeldt.previewSykmeldinger.map((it) => it.id),
    });

    const latestPeriod = data?.sykmeldinger.length ? getLatestPeriod(data.sykmeldinger) : null;
    const isError = error || (!isLoading && !latestPeriod);

    if (isError && !data?.sykmeldinger) {
        return (
            <Alert className={styles.noSykmeldingAlert} variant="error">
                Klarte ikke å laste sykmeldingene
            </Alert>
        );
    }

    return (
        <Accordion className={styles.accordionRoot}>
            {!isError && (
                <Accordion.Item open={expanded}>
                    <Accordion.Header
                        className={styles.accordionHeader}
                        onClick={() => {
                            onClick(previewSykmeldt.narmestelederId, 'periods');
                        }}
                    >
                        <InformationFilled className={styles.infoIcon} />
                        {isLoading && <Loader size="small" variant="interaction" />}
                        {!isLoading && latestPeriod && (
                            <SummaryHeaderContent
                                navn={previewSykmeldt.navn}
                                period={latestPeriod}
                                expanded={expanded}
                            />
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

function SummaryHeaderContent({
    navn,
    period,
    expanded,
}: {
    navn: string;
    period: SykmeldingPeriodeFragment;
    expanded: boolean;
}): JSX.Element {
    return (
        <>
            <div className={styles.headerLabelWrapper}>
                <BodyShort size="small">
                    {formatNameSubjective(navn.split(' ')[0])} er {getSykmeldingPeriodDescription(period)} til{' '}
                    {formatDate(period.tom)}
                </BodyShort>
            </div>
            <BodyShort size="small">Se {expanded ? 'mindre' : 'mer'}</BodyShort>
        </>
    );
}
