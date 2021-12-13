import { BodyShort } from '@navikt/ds-react';
import React from 'react';

import CheckboxIcon from '../icons/CheckboxIcon';

import styles from './CheckboxExplanation.module.css';

function CheckboxExplanation({ text }: { text: string }): JSX.Element {
    return (
        <div className={styles.checkboxExplainationRoot}>
            <CheckboxIcon className={styles.checkboxIcon} />
            <BodyShort size="small">{text}</BodyShort>
        </div>
    );
}

export default CheckboxExplanation;
