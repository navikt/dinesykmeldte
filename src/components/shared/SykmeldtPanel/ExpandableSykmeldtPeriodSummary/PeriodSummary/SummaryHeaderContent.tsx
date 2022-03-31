import { BodyShort, Label } from '@navikt/ds-react';
import { Historic } from '@navikt/ds-icons';

import { formatNamePossessive } from '../../../../../utils/sykmeldtUtils';

import styles from './SummaryHeaderContent.module.css';

interface Props {
    name: string;
    expanded: boolean;
}

function SummaryHeaderContent({ name, expanded }: Props): JSX.Element {
    return (
        <>
            <Historic className={styles.infoIcon} />
            <div className={styles.headerLabelWrapper}>
                <Label>{formatNamePossessive(name.split(' ')[0], 'sykmeldingshistorikk')}</Label>
            </div>
            <BodyShort className={styles.seMerLabel} size="small">
                Se {expanded ? 'mindre' : 'mer'}
            </BodyShort>
        </>
    );
}

export default SummaryHeaderContent;
