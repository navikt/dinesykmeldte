import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';

import { cleanId } from '../../../utils/stringUtils';

import styles from './ListItem.module.css';

interface ListItemProps {
    title: string;
    text: string | string[];
}

export function ListItem({ title, text }: ListItemProps): JSX.Element {
    const listItemId = cleanId(title);

    return (
        <li className={styles.root} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="small" className={styles.heading} level="3">
                {title}
            </Heading>
            {Array.isArray(text) ? (
                text.map((it) => (
                    <BodyShort className={styles.bodyShort} key={it}>
                        {it}
                    </BodyShort>
                ))
            ) : (
                <BodyShort className={styles.bodyShort}>{text}</BodyShort>
            )}
        </li>
    );
}
