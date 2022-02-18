import React, { PropsWithChildren, ReactNode } from 'react';
import { BodyShort, Button, Heading } from '@navikt/ds-react';
import Link from 'next/link';
import { Back, Bandage, CoApplicant, Task } from '@navikt/ds-icons';
import { useRouter } from 'next/router';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { formatNamePossessive } from '../../utils/sykmeldtUtils';
import { cleanId } from '../../utils/stringUtils';

import styles from './SideNavigation.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment | null;
}

const SideNavigation = ({ sykmeldt, children }: Required<PropsWithChildren<Props>>): JSX.Element | null => {
    const activePage = useActivePage();

    return (
        <div className={styles.rootContainer}>
            <nav className={styles.menuContainer} aria-labelledby="side-menu-header">
                {sykmeldt && (
                    <>
                        <Heading id="side-menu-header" size="medium" className={styles.heading}>
                            {formatNamePossessive(sykmeldt, 'dokumenter')}
                        </Heading>
                        <ul className={styles.buttonList}>
                            <MenuItem
                                href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
                                icon={activePage === 'sykmelding' ? <Back /> : <Bandage />}
                                className={cn({ [styles.active]: activePage === 'sykmeldinger' })}
                            >
                                Sykmeldinger
                            </MenuItem>
                            {activePage === 'sykmelding' && (
                                <ActiveSubItem icon={<Bandage />}>Sykmelding</ActiveSubItem>
                            )}
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
                )}
            </nav>
            <section className={styles.pageContainer}>{children}</section>
            <div className={styles.sideMenuFiller} />
        </div>
    );
};

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

export default SideNavigation;
