import React, { PropsWithChildren } from 'react';

import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';

import ExpandableMobileNavigation from './ExpandableMobileNavigation';
import SideNavigationList from './SideNavigationList';
import styles from './SideNavigation.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment | null;
}

const SideNavigation = ({ sykmeldt, children }: Required<PropsWithChildren<Props>>): JSX.Element | null => {
    return (
        <div className={styles.rootContainer}>
            <div className={styles.content}>
                <nav className={styles.desktopMenuContainer} aria-labelledby="side-menu-header">
                    {sykmeldt && <SideNavigationList sykmeldt={sykmeldt} />}
                </nav>
                <section className={styles.pageContainer}>
                    {sykmeldt && (
                        <ExpandableMobileNavigation className={styles.mobileMenuAccordion} sykmeldt={sykmeldt}>
                            <SideNavigationList sykmeldt={sykmeldt} noHeader />
                        </ExpandableMobileNavigation>
                    )}
                    {children}
                </section>
                <div className={styles.sideMenuFiller} />
            </div>
        </div>
    );
};

export default SideNavigation;
