import { Accordion, BodyShort, Loader } from '@navikt/ds-react';
import { InformationFilled } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment, useSykmeldingerByIdsQuery } from '../../../../graphql/queries/react-query.generated';
import { getLatestPeriod } from '../../../../utils/sykmeldtUtils';
import { notNull } from '../../../../utils/tsUtils';
import Alert from '../../Alert/Alert';
import AccordionCloseButton from '../../buttons/AccordionCloseButton';

import PeriodSummary from './PeriodSummary/PeriodSummary';
import SummaryHeaderContent from './PeriodSummary/SummaryHeaderContent';
import styles from './ExpandableSykmeldtPeriodSummary.module.css';

interface Props {
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
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

    const handleClick = (): void => {
        onClick(previewSykmeldt.narmestelederId, 'periods');
    };

    return (
        <Accordion className={styles.accordionRoot}>
            {!isError && (
                <Accordion.Item open={expanded}>
                    <Accordion.Header
                        id={`sykmeldt-perioder-accordion-header-${previewSykmeldt.narmestelederId}`}
                        className={styles.accordionHeader}
                        onClick={handleClick}
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
                        <BodyShort>Oversikten viser sykmeldingsperioder for inntil 4 måneder tilbake i tid.</BodyShort>
                        {data?.sykmeldinger && (
                            <PeriodSummary
                                className={styles.accordionScrollableTable}
                                sykmeldinger={data.sykmeldinger}
                            />
                        )}
                        <AccordionCloseButton onClick={handleClick} />
                    </Accordion.Content>
                </Accordion.Item>
            )}
        </Accordion>
    );
}

export default ExpandableSykmeldtPeriodSummary;
