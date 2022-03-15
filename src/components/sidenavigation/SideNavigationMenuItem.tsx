import { Back, Bandage } from '@navikt/ds-icons';
import cn from 'classnames';
import { BodyShort, Button } from '@navikt/ds-react';
import React from 'react';
import Link from 'next/link';

import { cleanId } from '../../utils/stringUtils';

import { Pages, useActivePage } from './useActivePage';
import styles from './SideNavigationMenuItem.module.css';

type Props = { href: string; children: string; className?: string; external?: boolean } & (
    | {
          page?: Pages;
          childPage?: Pages;
          icons: {
              Normal: typeof Bandage;
              Notify: typeof Bandage;
          };
          notify: boolean;
      }
    | {
          Icon: typeof Bandage;
      }
);

export function SideNavigationMenuItem({ children, href, className, external, ...props }: Props): JSX.Element {
    const id = cleanId(children);
    const activePage = useActivePage();

    if ('Icon' in props) {
        const { Icon } = props;
        return (
            <li aria-labelledby={id}>
                <Link href={href} passHref>
                    <Button
                        id={id}
                        as="a"
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        variant="tertiary"
                        className={cn(styles.menuItem, className)}
                    >
                        <Icon />
                        {children}
                    </Button>
                </Link>
            </li>
        );
    }

    const {
        page,
        childPage,
        notify,
        icons: { Normal, Notify },
    } = props;
    const isThisPage = activePage === page;
    const isChildPage = activePage === childPage;
    let icon: 'normal' | 'notify' | 'back';
    if (isChildPage) {
        icon = 'back';
    } else if (isThisPage) {
        icon = 'normal';
    } else if (notify) {
        icon = 'notify';
    } else {
        icon = 'normal';
    }

    return (
        <li aria-labelledby={id}>
            <Link href={href} passHref>
                <Button
                    id={id}
                    as="a"
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    variant="tertiary"
                    className={cn(styles.menuItem, className, {
                        [styles.activeMenuItem]: isThisPage,
                        [styles.notifyingMenuItem]: !isThisPage && notify,
                    })}
                >
                    {icon === 'normal' && <Normal />}
                    {icon === 'notify' && <Notify className={styles.notifyingIcon} />}
                    {icon === 'back' && <Back />}
                    {children}
                    {!isThisPage && notify && <div className={styles.fakeBorderHack} />}
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
                <BodyShort id={id} size="small">
                    {children}
                </BodyShort>
            </div>
        </li>
    );
}
