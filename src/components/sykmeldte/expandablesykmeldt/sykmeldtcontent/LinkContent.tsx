import React from 'react';
import { LinkPanel } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';

import styles from './LinkContent.module.css';

interface Iconable {
    /* Any icon from @navikt/ds-icons will match this typing  */
    Icon: typeof Bandage;
}

interface PlainLinkContentProps extends Iconable {
    children: string;
}

export function PlainLinkContent({ children, Icon }: PlainLinkContentProps) {
    return (
        <div className={styles.plainLinkContentRoot}>
            <Icon className={styles.linkContentIcon} />
            <LinkPanel.Description className={styles.linkDescription}>{children}</LinkPanel.Description>
        </div>
    );
}

interface HighlightedLinkContentProps extends Iconable {
    children: string;
    description: string;
}

export function HighlightedLinkContent({ children, description, Icon }: HighlightedLinkContentProps) {
    return (
        <div className={styles.highlightedLinkContentRoot}>
            <Icon className={styles.linkContentIcon} />
            <div>
                <LinkPanel.Title>{children}</LinkPanel.Title>
                <LinkPanel.Description>{description}</LinkPanel.Description>
            </div>
        </div>
    );
}
