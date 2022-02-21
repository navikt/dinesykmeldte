import Link, { LinkProps } from 'next/link';
import React from 'react';
import { ButtonProps, Detail, LinkPanel as DsLinkPanel } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';
import cn from 'classnames';

import styles from './LinkPanel.module.css';

type LinkPanelProps = {
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
};

export function ButtonPanel({
    onClick,
    children,
    description,
    detail,
    tag,
    notify,
    Icon,
}: LinkPanelProps & Pick<ButtonProps, 'onClick'>): JSX.Element {
    const { shouldNotify, shouldNotifyBg } = getNotifyOptions(notify);

    return (
        <DsLinkPanel
            as="button"
            // @ts-expect-error LinkPanel doesn't infer onClick type correctly when using `as`
            onClick={onClick}
            className={cn(styles.dsLinkPanel, {
                [styles.dsLinkPanelNotify]: shouldNotify,
                [styles.dsLinkPanelNotifyBackground]: shouldNotifyBg,
            })}
        >
            <PanelContent shouldNotify={shouldNotify} description={description} detail={detail} tag={tag} Icon={Icon}>
                {children}
            </PanelContent>
        </DsLinkPanel>
    );
}

export function LinkPanel({
    href,
    children,
    description,
    detail,
    tag,
    notify,
    Icon,
}: LinkPanelProps & Pick<LinkProps, 'href'>): JSX.Element {
    const { shouldNotify, shouldNotifyBg } = getNotifyOptions(notify);

    return (
        <Link href={href} passHref>
            <DsLinkPanel
                className={cn(styles.dsLinkPanel, {
                    [styles.dsLinkPanelNotify]: shouldNotify,
                    [styles.dsLinkPanelNotifyBackground]: shouldNotifyBg,
                })}
            >
                <PanelContent
                    shouldNotify={shouldNotify}
                    description={description}
                    detail={detail}
                    tag={tag}
                    Icon={Icon}
                >
                    {children}
                </PanelContent>
            </DsLinkPanel>
        </Link>
    );
}

function PanelContent({
    children,
    shouldNotify,
    description,
    detail,
    tag,
    Icon,
}: { shouldNotify: boolean } & Pick<
    LinkPanelProps,
    'children' | 'description' | 'detail' | 'tag' | 'Icon'
>): JSX.Element {
    return (
        <>
            <Icon className={cn(styles.linkContentIcon, { [styles.linkContentIconNotify]: shouldNotify })} />
            <div className={styles.innerPanelContent}>
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
            </div>
        </>
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
