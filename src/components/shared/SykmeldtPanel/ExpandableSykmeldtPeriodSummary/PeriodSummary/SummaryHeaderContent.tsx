import { BodyLong, BodyShort } from '@navikt/ds-react';
import { Historic, Sandglass } from '@navikt/ds-icons';

import { SykmeldingFragment } from '../../../../../graphql/queries/graphql.generated';
import { formatPeriodsRelative } from '../../../../../utils/sykmeldingPeriodUtils';

import styles from './SummaryHeaderContent.module.css';

interface Props {
    navn: string;
    sykmeldinger: SykmeldingFragment[];
    expanded: boolean;
}

function SummaryHeaderContent({ navn, sykmeldinger, expanded }: Props): JSX.Element {
    const { text, time } = formatPeriodsRelative(navn, sykmeldinger);

    return (
        <>
            {time === 'future' ? <Sandglass className={styles.infoIcon} /> : <Historic className={styles.infoIcon} />}
            <div className={styles.headerLabelWrapper}>
                <BodyLong size="small">{text}</BodyLong>
            </div>
            <BodyShort className={styles.seMerLabel} size="small">
                Se {expanded ? 'mindre' : 'mer'}
            </BodyShort>
        </>
    );
}

export default SummaryHeaderContent;
