import { BodyShort } from '@navikt/ds-react';

import { SykmeldingFragment } from '../../../../../graphql/queries/graphql.generated';
import { notNull } from '../../../../../utils/tsUtils';

import PeriodSummaryTable from './PeriodSummaryTable';
import styles from './PeriodSummary.module.css';

function PeriodSummary({ sykmeldinger }: { sykmeldinger: SykmeldingFragment[] }): JSX.Element {
    return (
        <div>
            <BodyShort className={styles.infoText}>
                Oversikten viser sykmeldingsperioder for inntil 4 måneder tilbake i tid.
            </BodyShort>
            <PeriodSummaryTable perioder={sykmeldinger?.flatMap((it) => it?.perioder).filter(notNull)} />
        </div>
    );
}

export default PeriodSummary;
