import { BodyShort } from '@navikt/ds-react';

import { SykmeldingPeriodeFragment } from '../../../../../graphql/queries/react-query.generated';
import { formatNameSubjective } from '../../../../../utils/sykmeldtUtils';
import { getSykmeldingPeriodDescription } from '../../../../../utils/sykmeldingUtils';
import { formatDate } from '../../../../../utils/dateUtils';

import styles from './SummaryHeaderContent.module.css';

interface Props {
    navn: string;
    period: SykmeldingPeriodeFragment;
    expanded: boolean;
}

function SummaryHeaderContent({ navn, period, expanded }: Props): JSX.Element {
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

export default SummaryHeaderContent;
