import { Accordion } from '@navikt/ds-react';

import { notNull } from '../../../../utils/tsUtils';
import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated';

import PeriodSummary from './PeriodSummary/PeriodSummary';
import SummaryHeaderContent from './PeriodSummary/SummaryHeaderContent';
import styles from './ExpandableSykmeldtPeriodSummary.module.css';

interface Props {
    expanded: boolean;
    onClick: (id: string, where: 'periods') => void;
    previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
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
                    <SummaryHeaderContent
                        navn={previewSykmeldt.navn}
                        sykmeldinger={previewSykmeldt.sykmeldinger.filter(notNull)}
                        expanded={expanded}
                    />
                </Accordion.Header>
                <Accordion.Content className={styles.accordionContent}>
                    <PeriodSummary sykmeldinger={previewSykmeldt.sykmeldinger} />
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
}

export default ExpandableSykmeldtPeriodSummary;
