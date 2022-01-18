import Link, { LinkProps } from 'next/link';
import React from 'react';
import { Detail, LinkPanel as DsLinkPanel } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';
import cn from 'classnames';

import styles from './LinkPanel.module.css';

interface LinkPanelProps extends Pick<LinkProps, 'href'> {
    /* Any icon from @navikt/ds-icons will match this typing  */
    Icon: typeof Bandage;
    children: string;
    description?: React.ReactNode;
    notify?:
        | boolean
        | {
              notify: boolean;
              disableWarningBackground: boolean;
          };
    detail?: string;
    tag?: React.ReactNode;
}

export function LinkPanel({ href, children, description, detail, tag, notify, Icon }: LinkPanelProps): JSX.Element {
    const { shouldNotify, shouldNotifyBg } = getNotifyOptions(notify);

    return (
        <Link href={href} passHref>
            <DsLinkPanel
                className={cn(styles.dsLinkPanel, {
                    [styles.dsLinkPanelNotify]: shouldNotify,
                    [styles.dsLinkPanelNotifyBackground]: shouldNotifyBg,
                })}
            >
                <Icon className={cn(styles.linkContentIcon, { [styles.linkContentIconNotify]: shouldNotify })} />
                <div className={styles.mainContent}>
                    {detail && <Detail size="small">{detail}</Detail>}
                    <DsLinkPanel.Title>{children}</DsLinkPanel.Title>
                    {description && (
                        <DsLinkPanel.Description className={styles.panelDescription}>
                            {description}
                        </DsLinkPanel.Description>
                    )}
                </div>
                {tag && <div>{tag}</div>}
            </DsLinkPanel>
        </Link>
    );
}

function getNotifyOptions(notify?: boolean | { notify: boolean; disableWarningBackground: boolean }): {
    shouldNotify: boolean;
    shouldNotifyBg: boolean;
} {
    if (typeof notify === 'object') {
        return { shouldNotify: notify.notify, shouldNotifyBg: !notify.disableWarningBackground };
    } else {
        return { shouldNotify: notify ?? false, shouldNotifyBg: notify ?? false };
    }
}

export default LinkPanel;
