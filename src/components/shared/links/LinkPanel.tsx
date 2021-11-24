import Link, { LinkProps } from 'next/link';
import React from 'react';
import { LinkPanel as DsLinkPanel } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';

import styles from './LinkPanel.module.css';

interface Iconable {
    /* Any icon from @navikt/ds-icons will match this typing  */
    Icon: typeof Bandage;
}

interface LinkPanelProps extends Iconable, Pick<LinkProps, 'href'> {
    children: string;
}

export function LinkPanel({ href, children, Icon }: LinkPanelProps) {
    return (
        <Link href={href} passHref>
            <DsLinkPanel>
                <div className={styles.plainLinkContentRoot}>
                    <Icon className={styles.linkContentIcon} />
                    <DsLinkPanel.Description className={styles.linkDescription}>{children}</DsLinkPanel.Description>
                </div>
            </DsLinkPanel>
        </Link>
    );
}

interface HighlightedLinkPanelProps extends Iconable, Pick<LinkProps, 'href'> {
    children: string;
    description: string;
}

export function HighlightedLinkPanel({ href, children, description, Icon }: HighlightedLinkPanelProps) {
    return (
        <Link href={href} passHref>
            <DsLinkPanel className={styles.panelHasNotification}>
                <div className={styles.highlightedLinkContentRoot}>
                    <Icon className={styles.linkContentIcon} />
                    <div>
                        <DsLinkPanel.Title>{children}</DsLinkPanel.Title>
                        <DsLinkPanel.Description>{description}</DsLinkPanel.Description>
                    </div>
                </div>
            </DsLinkPanel>
        </Link>
    );
}
