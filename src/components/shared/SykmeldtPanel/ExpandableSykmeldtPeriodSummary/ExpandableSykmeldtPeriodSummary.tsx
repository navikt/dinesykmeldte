import { Accordion, BodyShort, HelpText, Loader } from '@navikt/ds-react';
import { useState } from 'react';
import { Warning } from '@navikt/ds-icons';

import { notNull } from '../../../../utils/tsUtils';
import Alert from '../../Alert/Alert';
import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated';
import useSykmeldingerByIds from '../../../../hooks/useSykmeldingerByIds';
import LinkButton from '../../links/LinkButton';

import PeriodSummary from './PeriodSummary/PeriodSummary';
import SummaryHeaderContent from './PeriodSummary/SummaryHeaderContent';
import styles from './ExpandableSykmeldtPeriodSummary.module.css';

interface Props {
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
    const { data, loading, error, refetch } = useSykmeldingerByIds(previewSykmeldt);
    const periodsCount = data?.sykmeldinger.flatMap((it) => it?.perioder).filter(notNull).length ?? 0;

    if ((error && !data?.sykmeldinger) || (!loading && periodsCount === 0)) {
        return (
            <SykmledtPeriodeSummaryError
                narmestelederId={previewSykmeldt.narmestelederId}
                loading={loading}
                refetch={refetch}
            />
        );
    }

    return (
        <Accordion className={styles.accordionRoot}>
            <Accordion.Item open={expanded}>
                <Accordion.Header
                    id={`sykmeldt-perioder-accordion-header-${previewSykmeldt.narmestelederId}`}
                    className={styles.accordionHeader}
                    onClick={() => {
                        onClick(previewSykmeldt.narmestelederId, 'periods');
                    }}
                >
                    {loading && <Loader size="small" variant="interaction" />}
                    {!loading && data?.sykmeldinger && (
                        <SummaryHeaderContent
                            navn={previewSykmeldt.navn}
                            sykmeldinger={data.sykmeldinger.filter(notNull)}
                            expanded={expanded}
                        />
                    )}
                </Accordion.Header>
                <Accordion.Content className={styles.accordionContent}>
                    {data?.sykmeldinger && <PeriodSummary sykmeldinger={data.sykmeldinger} />}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
}

function SykmledtPeriodeSummaryError({
    narmestelederId,
    loading,
    refetch,
}: {
    narmestelederId: string;
    loading: boolean;
    refetch: () => void;
}): JSX.Element {
    const [hasRefetched, setHasRefetched] = useState(false);
    return (
        <Alert className={styles.noSykmeldingAlert} variant="error" id={`sykmeldinger-error-${narmestelederId}`}>
            Klarte ikke å laste sykmeldingsperiodene
            <HelpText placement="left">
                <div className={styles.helpTextContent}>
                    <BodyShort spacing>
                        Vi klarer for øyeblikket ikke å hente inn sykmeldingsperiodene til den sykmeldte.
                    </BodyShort>
                    <BodyShort spacing>
                        Vi jobber med å rette feilen, men du kan prøve å{' '}
                        <LinkButton
                            onClick={() => {
                                setHasRefetched(true);
                                refetch();
                            }}
                        >
                            laste sykmeldingsperiodene på nytt
                        </LinkButton>
                        . Prøv igjen om noen minutter om det fortsatt ikke fungerer.
                    </BodyShort>
                    {loading && (
                        <div className={styles.refetchSpinner}>
                            <Loader size="xsmall" />
                            <BodyShort>Prøver å hente sykmeldingsperioder på nytt...</BodyShort>
                        </div>
                    )}
                    {hasRefetched && !loading && (
                        <div className={styles.refetchSpinner}>
                            <Warning />
                            <BodyShort>Klarte ikke å hente periodene. Prøv igjen senere.</BodyShort>
                        </div>
                    )}
                </div>
            </HelpText>
        </Alert>
    );
}

export default ExpandableSykmeldtPeriodSummary;
