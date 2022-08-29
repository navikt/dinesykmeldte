import { BodyShort, Label } from '@navikt/ds-react';
import { Historic } from '@navikt/ds-icons';

import { formatFirstNamePossessive } from '../../../../../utils/sykmeldtUtils';

import styles from './SummaryHeaderContent.module.css';

interface Props {
    name: string;
    expanded: boolean;
}

function SummaryHeaderContent({ name, expanded }: Props): JSX.Element {
    return (
        <div className={styles.headerContentRoot}>
            <Historic className={styles.infoIcon} />
            <div className={styles.headerLabelWrapper}>
                <Label>{formatFirstNamePossessive(name, 'sykmeldingshistorikk')}</Label>
            </div>
            <BodyShort className={styles.seMerLabel} size="small">
                Se {expanded ? 'mindre' : 'mer'}
            </BodyShort>
        </div>
    );
}

export default SummaryHeaderContent;
