import { Back, Bandage } from '@navikt/ds-icons';
import cn from 'classnames';
import { Button, Label } from '@navikt/ds-react';
import React from 'react';
import Link from 'next/link';

import { cleanId } from '../../utils/stringUtils';

import { Pages, useActivePage } from './useActivePage';
import styles from './SideNavigationMenuItem.module.css';

interface BaseProps {
    href: string;
    children: string;
    className?: string;
    external?: 'proxy' | 'relative';
}

interface SimpleSideNavigationMenuItemProps extends BaseProps {
    Icon: typeof Bandage;
    notifications?: number;
}

export function SimpleSideNavigationMenuItem({
    href,
    className,
    Icon,
    children,
    external,
    notifications,
}: SimpleSideNavigationMenuItemProps): JSX.Element {
    const id = cleanId(children);

    let icon: 'normal' | 'notifications';
    if (notifications && notifications > 0) {
        icon = 'notifications';
    } else {
        icon = 'normal';
    }

    const content = (
        <>
            {icon === 'normal' && <Icon className={styles.icon} />}
            {icon === 'notifications' && <div className={styles.notifcationDot}>{notifications}</div>}
            <Label size="small">{children}</Label>
        </>
    );

    const buttonProps = {
        id,
        as: 'a' as const,
        variant: 'tertiary' as const,
        className: cn(styles.menuItem, className, {
            [styles.notifyingMenuItem]: notifications,
        }),
    };

    if (external === 'relative') {
        return (
            <li aria-labelledby={id}>
                <Button target="_blank" rel="noopener noreferrer" href={href} {...buttonProps}>
                    {content}
                </Button>
            </li>
        );
    }
    return (
        <li aria-labelledby={id}>
            <Link href={href} passHref>
                <Button {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...buttonProps}>
                    {content}
                </Button>
            </Link>
        </li>
    );
}

interface SideNavigationMenuItemProps extends BaseProps {
    page?: Pages;
    childPage?: Pages;
    icons: {
        Normal: typeof Bandage;
    };
    notifications: number;
}

export function SideNavigationMenuItem({
    children,
    href,
    className,
    external,
    page,
    childPage,
    notifications,
    icons: { Normal },
}: SideNavigationMenuItemProps): JSX.Element {
    const id = cleanId(children);
    const activePage = useActivePage();

    const isThisPage = activePage === page;
    const isChildPage = activePage === childPage;
    let icon: 'normal' | 'notifications' | 'back';
    if (isChildPage) {
        icon = 'back';
    } else if (isThisPage) {
        icon = 'normal';
    } else if (notifications > 0) {
        icon = 'notifications';
    } else {
        icon = 'normal';
    }

    const content = (
        <>
            {icon === 'normal' && <Normal className={styles.icon} />}
            {icon === 'notifications' && <div className={styles.notifcationDot}>{notifications}</div>}
            {icon === 'back' && <Back className={styles.icon} />}
            <Label size="small">{children}</Label>
        </>
    );

    const buttonProps = {
        id,
        as: 'a' as const,
        variant: 'tertiary' as const,
        className: cn(styles.menuItem, className, {
            [styles.activeMenuItem]: isThisPage,
            [styles.notifyingMenuItem]: !isThisPage && notifications,
        }),
    };

    if (external === 'relative') {
        return (
            <li aria-labelledby={id}>
                <Button target="_blank" rel="noopener noreferrer" href={href} {...buttonProps}>
                    {content}
                </Button>
            </li>
        );
    }

    return (
        <li aria-labelledby={id}>
            <Link href={href} passHref>
                <Button {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...buttonProps}>
                    {content}
                </Button>
            </Link>
        </li>
    );
}

export function ActiveSubItem({
    Icon,
    className,
    children,
}: {
    Icon: typeof Bandage;
    className?: string;
    children: string;
}): JSX.Element {
    const id = cleanId(children);
    return (
        <li aria-labelledby={id}>
            <div className={cn(styles.activeSubItem, className)}>
                <Icon />
                <Label id={id} size="small">
                    {children}
                </Label>
            </div>
        </li>
    );
}
