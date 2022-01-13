import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';

import { cleanId } from '../../../utils/stringUtils';

import styles from './SykmeldingInfoItem.module.css';

interface SykmledingInfoItemProps {
    title: string;
    text: string | string[];
}

export function SykmeldingInfoItem({ title, text }: SykmledingInfoItemProps) {
    const infoItemId = cleanId(title);

    return (
        <li className={styles.root} aria-labelledby={infoItemId}>
            <Heading id={infoItemId} size="small" className={styles.heading}>
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
