import { Heading } from '@navikt/ds-react';
import React from 'react';

import { cleanId } from '../../../utils/stringUtils';
import CheckboxExplanation from '../checkboxexplanation/CheckboxExplanation';

import styles from './ListItemCheckbox.module.css';

interface ListItemCheckboxProps {
    title: string;
    value: boolean;
}

export function ListItemCheckbox({ title, value }: ListItemCheckboxProps): JSX.Element {
    const listItemId = cleanId(title);

    return (
        <li className={styles.root} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" className={styles.heading} level="3">
                {title}
            </Heading>
            <CheckboxExplanation text={value ? 'Ja' : 'Nei'} />
        </li>
    );
}
