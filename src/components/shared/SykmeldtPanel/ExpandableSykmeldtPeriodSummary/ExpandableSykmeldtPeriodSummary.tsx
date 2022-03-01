import { Accordion, Loader } from '@navikt/ds-react';
import { InformationFilled } from '@navikt/ds-icons';
import { useApolloClient, useQuery } from '@apollo/client';

import { getLatestPeriod } from '../../../../utils/sykmeldtUtils';
import { notNull } from '../../../../utils/tsUtils';
import Alert from '../../Alert/Alert';
import {
    PreviewSykmeldtFragment,
    SykmeldingByIdDocument,
    SykmeldingerByIdsDocument,
} from '../../../../graphql/queries/graphql.generated';

import PeriodSummary from './PeriodSummary/PeriodSummary';
import SummaryHeaderContent from './PeriodSummary/SummaryHeaderContent';
import styles from './ExpandableSykmeldtPeriodSummary.module.css';

interface Props {
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
    const client = useApolloClient();
    const { loading, data, error } = useQuery(SykmeldingerByIdsDocument, {
        variables: {
            ids: previewSykmeldt.previewSykmeldinger.map((it) => it.id),
        },
        onCompleted: (result) => {
            result.sykmeldinger.filter(notNull).forEach((it) => {
                client.writeQuery({
                    query: SykmeldingByIdDocument,
                    variables: { sykmeldingId: it.id },
                    data: { sykmelding: it },
                });
            });
        },
    });

    const latestPeriod = data?.sykmeldinger.length ? getLatestPeriod(data.sykmeldinger) : null;
    const isError = error || (!loading && !latestPeriod);
    const periodsCount = data?.sykmeldinger.flatMap((it) => it?.perioder).filter(notNull).length ?? 0;

    if ((isError && !data?.sykmeldinger) || (!loading && periodsCount === 0)) {
        return (
            <Alert
                className={styles.noSykmeldingAlert}
                variant="error"
                id={`sykmeldinger-error-${previewSykmeldt.narmestelederId}`}
            >
                Klarte ikke å laste sykmeldingene
            </Alert>
        );
    }

    return (
        <Accordion className={styles.accordionRoot}>
            {!isError && (
                <Accordion.Item open={expanded}>
                    <Accordion.Header
                        id={`sykmeldt-perioder-accordion-header-${previewSykmeldt.narmestelederId}`}
                        className={styles.accordionHeader}
                        onClick={() => {
                            onClick(previewSykmeldt.narmestelederId, 'periods');
                        }}
                    >
                        <InformationFilled className={styles.infoIcon} />
                        {loading && <Loader size="small" variant="interaction" />}
                        {!loading && latestPeriod && (
                            <SummaryHeaderContent
                                navn={previewSykmeldt.navn}
                                period={latestPeriod}
                                expanded={expanded}
                            />
                        )}
                    </Accordion.Header>
                    <Accordion.Content className={styles.accordionContent}>
                        {data?.sykmeldinger && <PeriodSummary sykmeldinger={data.sykmeldinger} />}
                    </Accordion.Content>
                </Accordion.Item>
            )}
        </Accordion>
    );
}

export default ExpandableSykmeldtPeriodSummary;
