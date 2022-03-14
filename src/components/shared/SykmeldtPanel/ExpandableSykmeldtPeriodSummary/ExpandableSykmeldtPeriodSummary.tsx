import { Accordion, Loader } from '@navikt/ds-react';

import { notNull } from '../../../../utils/tsUtils';
import Alert from '../../Alert/Alert';
import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated';
import useSykmeldingerByIds from '../../../../hooks/useSykmeldingerByIds';

import PeriodSummary from './PeriodSummary/PeriodSummary';
import SummaryHeaderContent from './PeriodSummary/SummaryHeaderContent';
import styles from './ExpandableSykmeldtPeriodSummary.module.css';

interface Props {
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
    const { data, loading, error } = useSykmeldingerByIds(previewSykmeldt);
    const periodsCount = data?.sykmeldinger.flatMap((it) => it?.perioder).filter(notNull).length ?? 0;

    if ((error && !data?.sykmeldinger) || (!loading && periodsCount === 0)) {
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

export default ExpandableSykmeldtPeriodSummary;
