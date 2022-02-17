import { Accordion, Loader } from '@navikt/ds-react';
import { InformationFilled } from '@navikt/ds-icons';

import { PreviewSykmeldtFragment, useSykmeldingerByIdsQuery } from '../../../../graphql/queries/react-query.generated';
import { getLatestPeriod } from '../../../../utils/sykmeldtUtils';
import { notNull } from '../../../../utils/tsUtils';
import Alert from '../../../shared/Alert/Alert';

import SummaryContent from './SummaryContent/SummaryContent';
import SummaryHeaderContent from './SummaryContent/SummaryHeaderContent';
import styles from './ExpandableSykmeldtSummary.module.css';

interface Props {
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
    const { isLoading, data, error } = useSykmeldingerByIdsQuery({
        ids: previewSykmeldt.previewSykmeldinger.map((it) => it.id),
    });

    const latestPeriod = data?.sykmeldinger.length ? getLatestPeriod(data.sykmeldinger) : null;
    const isError = error || (!isLoading && !latestPeriod);
    const periodsCount = data?.sykmeldinger.flatMap((it) => it?.perioder).filter(notNull).length ?? 0;

    if ((isError && !data?.sykmeldinger) || (!isLoading && periodsCount === 0)) {
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

export default ExpandableSykmeldtSummary;
