import React, { PropsWithChildren, ReactNode } from 'react';
import { Button, Heading } from '@navikt/ds-react';
import Link from 'next/link';
import { Bandage, CoApplicant, Task } from '@navikt/ds-icons';
import { useRouter } from 'next/router';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { formatNamePossessive } from '../../utils/sykmeldtUtils';

import styles from './SideNavigation.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment | null;
}

const SideNavigation = ({ sykmeldt, children }: Required<PropsWithChildren<Props>>): JSX.Element | null => {
    const activePage = useActivePage();
    if (!sykmeldt) return null;

    return (
        <div className={styles.rootContainer}>
            <nav className={styles.menuContainer}>
                <Heading size="medium" className={styles.heading}>
                    {formatNamePossessive(sykmeldt, 'dokumenter')}
                </Heading>
                <div className={styles.buttonList}>
                    <MenuItem
                        href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
                        icon={<Bandage />}
                        className={cn({ [styles.active]: activePage === 'sykmeldinger' })}
                    >
                        Sykmeldinger
                    </MenuItem>
                    <MenuItem
                        href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`}
                        icon={<Task />}
                        className={cn({ [styles.active]: activePage === 'soknader' })}
                    >
                        Søknader om sykmeldinger
                    </MenuItem>
                    <MenuItem href="/" icon={<CoApplicant />} className={styles.lastItem}>
                        Dine sykmeldte
                    </MenuItem>
                </div>
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
}: PropsWithChildren<{ className?: string; href: string; icon: ReactNode }>): JSX.Element {
    return (
        <Link href={href} passHref>
            <Button as="a" variant="tertiary" className={cn(styles.menuItem, className)}>
                {icon}
                {children}
            </Button>
        </Link>
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
