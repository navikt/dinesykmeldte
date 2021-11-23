import Link, { LinkProps } from 'next/link';
import React from 'react';
import { LinkPanel } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';

import styles from './LinkContent.module.css';

interface Iconable {
    /* Any icon from @navikt/ds-icons will match this typing  */
    Icon: typeof Bandage;
}

interface PlainLinkContentProps extends Iconable, Pick<LinkProps, 'href'> {
    children: string;
}

export function PlainLinkContent({ href, children, Icon }: PlainLinkContentProps) {
    return (
        <Link href={href} passHref>
            <LinkPanel>
                <div className={styles.plainLinkContentRoot}>
                    <Icon className={styles.linkContentIcon} />
                    <LinkPanel.Description className={styles.linkDescription}>{children}</LinkPanel.Description>
                </div>
            </LinkPanel>
        </Link>
    );
}

interface HighlightedLinkContentProps extends Iconable, Pick<LinkProps, 'href'> {
    children: string;
    description: string;
}

export function HighlightedLinkContent({ href, children, description, Icon }: HighlightedLinkContentProps) {
    return (
        <Link href={href} passHref>
            <LinkPanel className={styles.panelHasNotification}>
                <div className={styles.highlightedLinkContentRoot}>
                    <Icon className={styles.linkContentIcon} />
                    <div>
                        <LinkPanel.Title>{children}</LinkPanel.Title>
                        <LinkPanel.Description>{description}</LinkPanel.Description>
                    </div>
                </div>
            </LinkPanel>
        </Link>
    );
}
