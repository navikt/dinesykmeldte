import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { Back, Bandage, CoApplicant, Task } from '@navikt/ds-icons';
import cn from 'classnames';
import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { cleanId } from '../../utils/stringUtils';
import { formatNamePossessive } from '../../utils/sykmeldtUtils';
import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';

import styles from './SideNavigationList.module.css';

function SideNavigationList({
    sykmeldt,
    noHeader = false,
}: {
    sykmeldt: PreviewSykmeldtFragment;
    noHeader?: boolean;
}): JSX.Element {
    const activePage = useActivePage();

    return (
        <>
            {!noHeader && (
                <Heading id="side-menu-header" size="medium" className={styles.heading}>
                    {formatNamePossessive(sykmeldt, 'dokumenter')}
                </Heading>
            )}
            <ul className={styles.buttonList}>
                <MenuItem
                    href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
                    icon={activePage === 'sykmelding' ? <Back /> : <Bandage />}
                    className={cn({ [styles.active]: activePage === 'sykmeldinger' })}
                >
                    Sykmeldinger
                </MenuItem>
                {activePage === 'sykmelding' && <ActiveSubItem icon={<Bandage />}>Sykmelding</ActiveSubItem>}
                <MenuItem
                    href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`}
                    icon={activePage === 'soknad' ? <Back /> : <Task />}
                    className={cn({ [styles.active]: activePage === 'soknader' })}
                >
                    Søknader om sykmeldinger
                </MenuItem>
                {activePage === 'soknad' && <ActiveSubItem icon={<CoApplicant />}>Soknad</ActiveSubItem>}
                <MenuItem href="/" icon={<CoApplicant />} className={styles.lastItem}>
                    Dine sykmeldte
                </MenuItem>
            </ul>
        </>
    );
}

function MenuItem({
    className,
    href,
    icon,
    children,
}: {
    className?: string;
    href: string;
    icon: ReactNode;
    children: string;
}): JSX.Element {
    const id = cleanId(children);
    return (
        <li aria-labelledby={id}>
            <Link href={href} passHref>
                <Button id={id} as="a" variant="tertiary" className={cn(styles.menuItem, className)}>
                    {icon}
                    {children}
                </Button>
            </Link>
        </li>
    );
}

function ActiveSubItem({
    icon,
    className,
    children,
}: {
    icon: ReactNode;
    className?: string;
    children: string;
}): JSX.Element {
    const id = cleanId(children);
    return (
        <li aria-labelledby={id}>
            <div className={cn(styles.activeSubItem, className)}>
                {icon}
                <BodyShort id={id} size="small">
                    {children}
                </BodyShort>
            </div>
        </li>
    );
}

function useActivePage(): 'sykmeldinger' | 'soknader' | 'sykmelding' | 'soknad' {
    const router = useRouter();

    if (router.pathname.endsWith('sykmeldinger')) {
        return 'sykmeldinger';
    } else if (router.pathname.endsWith('soknader')) {
        return 'soknader';
    } else if ('sykmeldingId' in router.query) {
        return 'sykmelding';
    } else if ('soknadId' in router.query) {
        return 'soknad';
    } else {
        throw new Error(`Illegal state: You cannot use side navigation on this path: ${router.pathname}`);
    }
}

export default SideNavigationList;
